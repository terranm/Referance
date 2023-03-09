import { Animator, Avatar, BoxCollider, Camera,  CharacterController, Collider, ForceMode, GameObject, Mathf, Quaternion, Rigidbody, RigidbodyConstraints, RuntimeAnimatorController, Time, Transform, Vector3 } from 'UnityEngine';
import { UnityEvent$1 } from 'UnityEngine.Events';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour,ZepetoScriptableObject  } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import DataSc from './DataSc';
import Interaction from './Interaction';
import StarterBackup from './Starter';

export default class PlayerCtrl extends ZepetoScriptBehaviour {

    public rb:Rigidbody;
    public boxCol:BoxCollider;
    private charCol:CharacterController;
    public multiplay:ZepetoWorldMultiplay;
    private starter:StarterBackup;
    private anim:Animator;
    public scriptable:ZepetoScriptableObject<DataSc>;

    //jetPack

    public sitPos:Transform;
    public CurrentSpeed:float = 0;
    public MaxSpeed: float = 20;
    public boostSpeed:float;
    private RealSpeed:float;
    public GLIDER_FLY:boolean;
    public gliderAnim:Animator;
    private wearPos:Transform;
    //tires
    public frontLeftTire:Transform;
    public frontRightTire:Transform;
    public backLeftTire:Transform;
    public backRightTire:Transform;
    
    public steerDirection:float;
    private driftTime:float;
    private driftLeft:boolean = false;
    private driftRight:boolean = false;
    private outwardsDriftForce:float = 50000;
    public isZipStart:boolean = false;
    private touchingGround:boolean;
    public isMove:boolean = false;
    public isBack:boolean = false;
    public isUp:boolean = false;
    public isDown:boolean = false;
    public isRide:boolean = false;
    public isDriftStart:boolean = false;
    public isDrifting:boolean = false;
    public BoostTime:float = 0;
    public steer:float = 0;
    public cameraObj:GameObject;
    public cameraObjPrefab:GameObject;
    public camera:Camera;
    public cameraOffset:Vector3 = new Vector3(0,2, 0);
    public boostCamPos:Vector3 = new Vector3(0,0.95, -5.5);
    public origCamPos:Vector3 = new Vector3(0,1.05, -6.5);
    public event:UnityEvent$1<int>;
    private car:GameObject;

    Awake(){
        this.event = new UnityEvent$1<int>();
    }
    Start() {    
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        this.MaxSpeed = 10;
        this.cameraObj = GameObject.Instantiate(this.cameraObjPrefab) as GameObject;//Find("SecondCamera");
        this.cameraObj.transform.parent = this.transform.parent;
        this.camera = this.cameraObj.transform.GetChild(0).GetComponent<Camera>();
        this.camera.enabled = false;
        this.starter = GameObject.Find("ClientStarter").GetComponent<StarterBackup>();
        this.StartCoroutine(this.Init());
        this.cameraOffset = new Vector3(0,2, 0);
        this.boostCamPos = new Vector3(0,0.95, -5.5);
        this.origCamPos = new Vector3(0,1.05, -6.5);
        this.cameraRotateSpeed = 9;
        
    }

    FixedUpdate(){
        if(this.isRide){
            this.move();
            this.Steer();
            //console.log("isRide");
        } 
    }
    private cameraRotateSpeed : number;
    LateUpdate(){
        if(!this.isRide) return;
        //console.log("isRide");
        this.cameraObj.transform.position = new Vector3(this.transform.parent.position.x + this.cameraOffset.x, this.transform.parent.position.y + this.cameraOffset.y, this.transform.parent.position.z + this.cameraOffset.z);
        
        // if (!this.GLIDER_FLY)
        // {
            this.cameraObj.transform.rotation = Quaternion.Slerp(this.cameraObj.transform.rotation, this.transform.parent.rotation, this.cameraRotateSpeed * Time.deltaTime); //normal    
        // }
        // else
        // {
        //     this.cameraObj.transform.rotation = Quaternion.Slerp(this.cameraObj.transform.rotation, Quaternion.Euler(0, this.transform.parent.eulerAngles.y, 0), this.cameraRotateSpeed * Time.deltaTime); 
        // }

        if (this.BoostTime > 0)
        {
            this.cameraObj.transform.GetChild(0).localPosition = Vector3.Lerp(this.cameraObj.transform.GetChild(0).localPosition, this.boostCamPos, this.cameraRotateSpeed * Time.deltaTime);
        }
        else
        {
            this.cameraObj.transform.GetChild(0).localPosition = Vector3.Lerp(this.cameraObj.transform.GetChild(0).localPosition, this.origCamPos, this.cameraRotateSpeed * Time.deltaTime);
        }

    }
    //차량 탑승 물리 충돌
    // OnTriggerEnter(other:Collider){
    //     console.log(other.gameObject.name + "살려줘요1");

    //     if(other.gameObject == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject){
    //         if(other.gameObject.tag =="CarPort"){
    //             other.gameObject.GetComponent<Interaction>().OpenUIActive();
    //         }
    //     }
    // }
    public Teleport(){
        if (this.isRide){
            this.CarStop();
        }
        
        this.StartCoroutine(this.Teleport_character());
        
        //this.transform.parent.transform.position = new Vector3(21,0,1.6);
        //this.transform.parent.transform.rotation = Quaternion.Euler(0, -47, 0);
    }

    *Teleport_character(){
        while(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position != new Vector3(-29,66,-123)){
            yield null;
            ZepetoPlayers.instance.LocalPlayer.StopMoving();
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position = new Vector3(-29,66,-123);
        }
    }
    
    public zipLinebeltPrefab : GameObject;
    private zipLinebelt : GameObject;
    private zipWearPos : Transform;

    public ZipLine(point : number, startposition : Vector3, endposition : Vector3){
        if (point == 0){
            if (this.isZipStart) return;
            ZepetoPlayers.instance.LocalPlayer.StopMoving();
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position = startposition;
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.LookAt(endposition);
            this.isZipStart = true;
            this.event.Invoke(2);
            this.anim.enabled = true;
            this.anim.SetBool("isFlying", true);
            this.zipLinebelt = GameObject.Instantiate(this.zipLinebeltPrefab) as GameObject;
            this.zipLinebelt.transform.position = this.zipWearPos.position;
            this.zipLinebelt.transform.Translate(0,0.25,0);
            this.zipLinebelt.transform.SetParent(this.zipWearPos);
            this.StartCoroutine(this.ZipLine_Move());
        }
        else if(point == 1) {
            this.isZipStart = false;
            this.event.Invoke(3);
            this.anim.SetBool("isFlying", false);
            this.anim.enabled = false;
            GameObject.Destroy(this.zipLinebelt);
            this.StopCoroutine(this.ZipLine_Move());
        }
    }
    
    *ZipLine_Move(){
        while(this.isZipStart){
            yield null;
            ZepetoPlayers.instance.LocalPlayer.StopMoving();
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.Translate(0, 0, 0.1);
        }
    }

    public CarRide(other:GameObject){
        console.log("aa");
        //제트팩일 시 
        if(other.tag == "Car"){
            console.log(other.name + "carRide");
            
            this.car = other.gameObject;
            this.car.transform.SetParent(this.wearPos);
            // this.car.transform.localPosition = new Vector3(0, 0.01, -0.1);
            // this.car.transform.localRotation = Quaternion.Euler(-4.1, 180, 265);
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.enabled = false;
            this.camera.enabled = true;
            this.charCol.enabled = false;
            this.boxCol.enabled = true;
            this.rb.useGravity = true;
            this.rb.isKinematic = false;
            this.isRide = true;
            this.event.Invoke(0);
            this.anim.enabled = true;
            //this.anim.SetBool("isFlying", true);
            this.anim.SetBool("isDrive", true);
            //ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.Translate(0,0.1,0);
            this.multiplay.Room.Send("isRide", this.isRide);
            console.log(this.car.name + " ride " + this.multiplay.Room.Id);
        }
    }

    public CarStop(){
        console.log(this.transform.name);
        
        this.car.transform.parent = null;
        GameObject.Destroy(this.car.gameObject);
        this.car = null;
        ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.enabled = true;
        this.camera.enabled = false;
        this.charCol.enabled = true;
        this.boxCol.enabled = false;
        this.rb.useGravity = false;
        this.rb.isKinematic = true;
        this.isRide = false;
        this.event.Invoke(1);
        this.anim.SetBool("isDrive", false);
        this.anim.enabled = false;
        this.multiplay.Room.Send("isRide", this.isRide);
    }




    *Init(){
        //let cnt :number = 0;
        while(true){
            yield null;
            if(this.transform.parent == null){
                // console.log("no Character - roop : " + ++cnt);
                // let players = GameObject.FindWithTag("Player");
                // console.log(players.name);
            }
            else {
                this.charCol = this.transform.parent.GetComponent<CharacterController>();
                this.boxCol = this.transform.parent.gameObject.AddComponent<BoxCollider>();
                this.anim = this.transform.parent.gameObject.AddComponent<Animator>();
                this.rb = this.transform.parent.gameObject.AddComponent<Rigidbody>();
                this.rb.useGravity = false;
                this.rb.isKinematic = true;
                this.rb.constraints = RigidbodyConstraints.FreezeRotation;
                this.boxCol.center = new Vector3(0.3, 0.4, -0.17);
                this.boxCol.size = new Vector3(1.6, 1.3, 4.3);
                //ZepetoCharacter스크립트를 끄면 ZepetoAnimator에 접근할 수 없기때문에 따로 animator컴포넌트를 부착해 줘야 하고 동적으로 애니메이터컨트롤러와 아바타를 넣어줌
                this.anim.runtimeAnimatorController = this.scriptable["anim"] as RuntimeAnimatorController;
                this.anim.avatar = this.scriptable["avatar"] as Avatar;
                this.anim.enabled = false;
                this.boxCol.enabled = false;
                this.wearPos = this.transform.parent.transform;//.GetChild(0).GetChild(1).GetChild(1).GetChild(0).transform;
                this.zipWearPos = this.transform.parent.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(0).transform;
                console.log(this.zipWearPos.name + " Character Load Complete");
                return;
            }
        }
    }

    move(){
        this.RealSpeed = this.transform.InverseTransformDirection(this.rb.velocity).z;
        
        if(this.isMove && !this.isBack){
            this.CurrentSpeed = Mathf.Lerp(this.CurrentSpeed, this.MaxSpeed, Time.deltaTime * 0.5);
        }
        else if(!this.isMove && this.isBack){
            this.CurrentSpeed = Mathf.Lerp(this.CurrentSpeed, -this.MaxSpeed / 1.75, 1 * Time.deltaTime);
        }
        else{
            this.CurrentSpeed = Mathf.Lerp(this.CurrentSpeed, 0, Time.deltaTime * 1.5);
        }

        if(!this.GLIDER_FLY){
            let vel = new Vector3(this.transform.parent.forward.x * this.CurrentSpeed, this.transform.parent.forward.y * this.CurrentSpeed, this.transform.parent.forward.z * this.CurrentSpeed);
            vel.y = this.rb.velocity.y;
            this.rb.velocity = vel;
        }
        else{
            let vel = this.transform.parent.forward * this.CurrentSpeed;
            vel.y = this.rb.velocity.y * 0.6;
            this.rb.velocity = vel;
        }
    }

    Steer(){
        //this.steerDirection = Input.GetAxisRaw("Horizontal");
        this.steerDirection = this.steer;
        let steerDirVect:Vector3;
        let steerAmount:float;
        
        steerAmount = this.RealSpeed > 30 ? this.RealSpeed / 4 * this.steerDirection : steerAmount = this.RealSpeed / 1 * this.steerDirection;
        // if (this.RealSpeed <= 0)
        //     return;
        let steerDir = !this.isMove && this.isBack ? this.steerDirection * 30 : this.steerDirection * -30;
        this.transform.parent.rotation = Quaternion.Lerp(
            this.transform.parent.rotation, 
            Quaternion.Euler(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y-(steerDir),this.transform.parent.eulerAngles.z), 
            2 * Time.deltaTime);
        // //glider
        // if(this.steerDirection < -0.25){//left
        //     this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y-10,this.transform.parent.eulerAngles.z), 2 * Time.deltaTime);
        // }
        // else if(this.steerDirection > 0.25){
        //     this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y+10,this.transform.parent.eulerAngles.z), 2 * Time.deltaTime);
        // }
        // else{
        //     this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(this.transform.parent.eulerAngles.x, 0,this.transform.parent.eulerAngles.z), 2 * Time.deltaTime);
        // }
        
        steerDirVect = new Vector3(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y + steerAmount, this.transform.parent.eulerAngles.z);
        this.transform.parent.eulerAngles = Vector3.Lerp(this.transform.parent.eulerAngles, steerDirVect, 3 * Time.deltaTime);
    }

}