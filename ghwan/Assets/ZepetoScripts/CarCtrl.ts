import { Animator, Avatar, Camera, CapsuleCollider, CharacterController, Collider, ForceMode, GameObject, Mathf, Quaternion, Rigidbody, RigidbodyConstraints, RuntimeAnimatorController, Time, Transform, Vector3 } from 'UnityEngine';
import { UnityEvent$1 } from 'UnityEngine.Events';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour,ZepetoScriptableObject  } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import GameManager from './GameManager';


export default class CarCtrl extends ZepetoScriptBehaviour {

    public rb:Rigidbody;
    
    public multiplay:ZepetoWorldMultiplay;
    //private starter:StarterBackup;
    private anim:Animator;
    //public scriptable:ZepetoScriptableObject<DataSc>;
    public cameraObj:GameObject;
    public camera:Camera;
    public cameraOffset:Vector3 = new Vector3(0,2, 0);
    public boostCamPos:Vector3 = new Vector3(0,0.95, -5.5);
    public origCamPos:Vector3 = new Vector3(0,1.05, -6.5);
    public steerDirVect:Vector3 = Vector3.zero;

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
    public isRide:boolean = false;
    public isMove:boolean = false;
    public isBack:boolean = false;
    public isUp:boolean = false;
    public isDown:boolean = false;
    
    public isDriftStart:boolean = false;
    public isDrifting:boolean = false;
    public BoostTime:float = 0;
    public steer:float = 0;
    
    
    Awake(){
        
    }
    Start() {    
        this.MaxSpeed = 10;
        this.rb = this.transform.gameObject.GetComponent<Rigidbody>();
        // this.cameraObj = GameObject.Find("SecondCamera");
        // this.camera = this.cameraObj.transform.GetComponent<Camera>();
        // this.camera.enabled = false;
        // this.cameraOffset = new Vector3(0,2, 0);
        // //this.boostCamPos = new Vector3(0,0.95, -5.5);
        // this.origCamPos = new Vector3(0,1.05, -6.5);
        // this.cameraOffset = new Vector3(0,2, 0);
        // //this.boostCamPos = new Vector3(0,0.95, -5.5);
        // this.origCamPos = new Vector3(0,1.05, -6.5);
        //this.starter = GameObject.Find("ClientStarter").GetComponent<StarterBackup>();
    }

    FixedUpdate(){
        if(this.isRide){    
            this.move();
            this.Steer();
            this.SendTransform();
        }
    }

    // LateUpdate(){
    //     this.cameraObj.transform.position = this.transform.position + this.cameraOffset;

    //     if (!this.GLIDER_FLY)
    //     {
    //         this.cameraObj.transform.rotation = Quaternion.Slerp(this.cameraObj.transform.rotation, this.transform.rotation, 3 * Time.deltaTime); //normal
    //     }
    //     // else
    //     // {
    //     //     this.cameraObj.transform.rotation = Quaternion.Slerp(this.cameraObj.transform.rotation, Quaternion.Euler(0, this.transform.parent.eulerAngles.y, 0), 3 * Time.deltaTime); 
    //     // }

    //     // if (this.BoostTime > 0)
    //     // {
    //     //     this.cameraObj.transform.GetChild(0).localPosition = Vector3.Lerp(this.cameraObj.transform.GetChild(0).localPosition, this.boostCamPos, 3 * Time.deltaTime);
    //     // }
    //     // else
    //     // {
    //     //     this.cameraObj.transform.GetChild(0).localPosition = Vector3.Lerp(this.cameraObj.transform.GetChild(0).localPosition, this.origCamPos, 3 * Time.deltaTime);
    //     // }

    // }
   

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
            let vel = this.transform.forward * this.CurrentSpeed;
            vel.y = this.rb.velocity.y;
            this.rb.velocity = vel;
        }
        else{
            let vel = this.transform.forward * this.CurrentSpeed;
            vel.y = this.rb.velocity.y * 0.6;
            this.rb.velocity = vel;
        }

    }

    Steer(){
        //this.steerDirection = Input.GetAxisRaw("Horizontal");
        this.steerDirection = this.steer;
        let steerAmount:float;
        
        
        steerAmount = this.RealSpeed > 30 ? this.RealSpeed / 4 * this.steerDirection : steerAmount = this.RealSpeed / 1 * this.steerDirection;

        //glider
        if(this.steerDirection < -0.25 && this.GLIDER_FLY){//left
            this.transform.rotation = Quaternion.SlerpUnclamped(this.transform.rotation, Quaternion.Euler(this.transform.eulerAngles.x, this.transform.eulerAngles.y, 40), 2 * Time.deltaTime);
        }
        else if(this.steerDirection > 0.25 && this.GLIDER_FLY){
            this.transform.rotation = Quaternion.SlerpUnclamped(this.transform.rotation, Quaternion.Euler(this.transform.eulerAngles.x, this.transform.eulerAngles.y, -40), 2 * Time.deltaTime);
        }
        else{
            this.transform.rotation = Quaternion.SlerpUnclamped(this.transform.rotation, Quaternion.Euler(this.transform.eulerAngles.x, this.transform.eulerAngles.y, 0), 2 * Time.deltaTime);
        }

        

        if(this.isUp && this.GLIDER_FLY){
            this.transform.parent.rotation = Quaternion.SlerpUnclamped(this.transform.rotation, Quaternion.Euler(25, this.transform.eulerAngles.y, this.transform.eulerAngles.z), 2 * Time.deltaTime);

            this.rb.AddForce(Vector3.down * 8000 * Time.deltaTime, ForceMode.Acceleration);
        }
        else if(this.isDown && this.GLIDER_FLY){
            this.transform.rotation = Quaternion.SlerpUnclamped(this.transform.rotation, Quaternion.Euler(-25, this.transform.eulerAngles.y, this.transform.eulerAngles.z), 2 * Time.deltaTime);

            this.rb.AddForce(Vector3.up * 8000 * Time.deltaTime, ForceMode.Acceleration);
        }
        else{
            this.transform.rotation = Quaternion.SlerpUnclamped(this.transform.rotation, Quaternion.Euler(0, this.transform.eulerAngles.y, this.transform.eulerAngles.z), 2 * Time.deltaTime);
        }

        this.steerDirVect = new Vector3(this.transform.eulerAngles.x, this.transform.eulerAngles.y + steerAmount * 2, this.transform.eulerAngles.z);
        this.transform.eulerAngles = Vector3.Lerp(this.transform.eulerAngles, this.steerDirVect, 3 * Time.deltaTime);
    }

    private SendTransform() {
        const data = new RoomData();

        const vel = new RoomData();
        vel.Add("x", this.rb.velocity.x);
        vel.Add("y", this.rb.velocity.y);
        vel.Add("z", this.rb.velocity.z);
        data.Add("velocity", vel.GetObject());

        const steer = new RoomData();
        steer.Add("x", this.steerDirVect.x);
        steer.Add("y", this.steerDirVect.y);
        steer.Add("z", this.steerDirVect.z);
        data.Add("steer", steer.GetObject());

        const pos = new RoomData();
        pos.Add("x", this.transform.localPosition.x);
        pos.Add("y", this.transform.localPosition.y);
        pos.Add("z", this.transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", this.transform.localEulerAngles.x);
        rot.Add("y", this.transform.localEulerAngles.y);
        rot.Add("z", this.transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        GameManager.Room().Send("onChangedVelocity", data.GetObject());
    }
}