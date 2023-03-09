import { Animator, Avatar, Camera, CapsuleCollider, CharacterController, Collider, ForceMode, GameObject, Mathf, Quaternion, Rigidbody, RigidbodyConstraints, RuntimeAnimatorController, Time, Transform, Vector3 } from 'UnityEngine';
import { UnityEvent$1 } from 'UnityEngine.Events';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour,ZepetoScriptableObject  } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import DataSc from './DataSc';
import StarterBackup from './Starter';

export default class PlayerCtrl extends ZepetoScriptBehaviour {

    public rb:Rigidbody;
    public capCol:CapsuleCollider;
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
    public isSliding:boolean = false;
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
    public camera:Camera;
    public cameraOffset:Vector3 = new Vector3(0,2, 0);
    public boostCamPos:Vector3 = new Vector3(0,0.95, -5.5);
    public origCamPos:Vector3 = new Vector3(0,1.05, -6.5);
    public event:UnityEvent$1<int>;
    private jetpack:GameObject;

    Awake(){
        this.event = new UnityEvent$1<int>();
    }
    Start() {    
        this.MaxSpeed = 10;
        this.cameraObj = GameObject.Find("SecondCamera");
        this.camera = this.cameraObj.transform.GetChild(0).GetComponent<Camera>();
        this.camera.enabled = false;
        this.starter = GameObject.Find("ClientStarter").GetComponent<StarterBackup>();
        this.StartCoroutine(this.Init());
        this.cameraOffset = new Vector3(0,2, 0);
        this.boostCamPos = new Vector3(0,0.95, -5.5);
        this.origCamPos = new Vector3(0,1.05, -6.5);
    }

    FixedUpdate(){
        if(this.isRide){
            this.move();
            this.Steer();
        }
    }

    LateUpdate(){
        if(!this.isRide) return;
        this.cameraObj.transform.position = this.transform.parent.position + this.cameraOffset;

        if (!this.GLIDER_FLY)
        {
            this.cameraObj.transform.rotation = Quaternion.Slerp(this.cameraObj.transform.rotation, this.transform.parent.rotation, 3 * Time.deltaTime); //normal
        }
        else
        {
            this.cameraObj.transform.rotation = Quaternion.Slerp(this.cameraObj.transform.rotation, Quaternion.Euler(0, this.transform.parent.eulerAngles.y, 0), 3 * Time.deltaTime); 
        }

        if (this.BoostTime > 0)
        {
            this.cameraObj.transform.GetChild(0).localPosition = Vector3.Lerp(this.cameraObj.transform.GetChild(0).localPosition, this.boostCamPos, 3 * Time.deltaTime);
        }
        else
        {
            this.cameraObj.transform.GetChild(0).localPosition = Vector3.Lerp(this.cameraObj.transform.GetChild(0).localPosition, this.origCamPos, 3 * Time.deltaTime);
        }

    }
    //차량 탑승 물리 충돌
    OnTriggerEnter(other:Collider){
        //제트팩일 시 
        console.log(other.gameObject.name);
        if(other.gameObject.name == "Jetpack"){
            this.jetpack = other.gameObject;
            this.jetpack.transform.SetParent(this.wearPos);
            this.jetpack.transform.localPosition = new Vector3(0, 0.01, -0.1);
            this.jetpack.transform.localRotation = Quaternion.Euler(-4.1, 180, 265);
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.enabled = false;
            this.camera.enabled = true;
            this.charCol.enabled = false;
            this.capCol.enabled = true;
            this.rb.useGravity = true;
            this.rb.isKinematic = false;
            this.isRide = true;
            this.event.Invoke(0);
            this.anim.enabled = true;
            this.anim.SetBool("isFlying", true);
        }
        else if(other.gameObject.tag == "Ground" && this.isRide){
            this.jetpack.transform.parent = null;
            this.jetpack.transform.position = this.starter.jetpackSpawnPos.position;
            this.jetpack.transform.rotation = this.starter.jetpackSpawnPos.rotation;
            ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.enabled = true;
            this.camera.enabled = false;
            this.charCol.enabled = true;
            this.capCol.enabled = false;
            this.rb.useGravity = false;
            this.rb.isKinematic = true;
            this.isRide = false;
            this.event.Invoke(1);
            this.anim.SetBool("isFlying", false);
            this.anim.enabled = false;
        }
        this.multiplay.Room.Send("Ride", this.isRide);
    }

    *Init(){
        while(true){
            yield null;
            console.log("Finding");
           if(this.transform.parent != null){
               this.charCol = this.transform.parent.GetComponent<CharacterController>();
               this.capCol = this.transform.parent.gameObject.AddComponent<CapsuleCollider>();
                this.anim = this.transform.parent.gameObject.AddComponent<Animator>();
                this.rb = this.transform.parent.gameObject.AddComponent<Rigidbody>();
                this.rb.useGravity = false;
                this.rb.isKinematic = true;
                this.rb.constraints = RigidbodyConstraints.FreezeRotation;
                this.capCol.center = new Vector3(0, 0.5, 0);
                this.capCol.radius = 0.25;
                this.capCol.height = 1.2;
                //ZepetoCharacter스크립트를 끄면 ZepetoAnimator에 접근할 수 없기때문에 따로 animator컴포넌트를 부착해 줘야 하고 동적으로 애니메이터컨트롤러와 아바타를 넣어줌
                this.anim.runtimeAnimatorController = this.scriptable["anim"] as RuntimeAnimatorController;
                this.anim.avatar = this.scriptable["avatar"] as Avatar;
                this.anim.enabled = false;
                this.capCol.enabled = false;
                this.wearPos = this.transform.parent.transform.GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(0).transform;
                console.log(this.wearPos);
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
            let vel = this.transform.parent.forward * this.CurrentSpeed;
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

        //glider
        if(this.steerDirection < -0.25 && this.GLIDER_FLY){//left
            this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y, 40), 2 * Time.deltaTime);
        }
        else if(this.steerDirection > 0.25 && this.GLIDER_FLY){
            this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y, -40), 2 * Time.deltaTime);
        }
        else{
            this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y, 0), 2 * Time.deltaTime);
        }

        

        if(this.isUp && this.GLIDER_FLY){
            this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(25, this.transform.parent.eulerAngles.y, this.transform.parent.eulerAngles.z), 2 * Time.deltaTime);

            this.rb.AddForce(Vector3.down * 8000 * Time.deltaTime, ForceMode.Acceleration);
        }
        else if(this.isDown && this.GLIDER_FLY){
            this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(-25, this.transform.parent.eulerAngles.y, this.transform.parent.eulerAngles.z), 2 * Time.deltaTime);

            this.rb.AddForce(Vector3.up * 8000 * Time.deltaTime, ForceMode.Acceleration);
        }
        else{
            this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.parent.rotation, Quaternion.Euler(0, this.transform.parent.eulerAngles.y, this.transform.parent.eulerAngles.z), 2 * Time.deltaTime);
        }

        steerDirVect = new Vector3(this.transform.parent.eulerAngles.x, this.transform.parent.eulerAngles.y + steerAmount, this.transform.parent.eulerAngles.z);
        this.transform.parent.eulerAngles = Vector3.Lerp(this.transform.parent.eulerAngles, steerDirVect, 3 * Time.deltaTime);
    }

}