import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import { Player} from 'ZEPETO.Multiplay.Schema';
import { UIZepetoPlayerControl, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { GameObject, Quaternion, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import ResourceManager from './ResourceManager';
import ResourcesManager from './ResourcesManager';
import UIManagers from './UIManagers';
import JoystickDir from './JoystickDir';
import CarCtrl from './CarCtrl';

export default class GameManager extends ZepetoScriptBehaviour {

    private static Instance:GameManager;
    public static get GetInstance():GameManager{
        
        return this.Instance;
    }
    public glassesMap:Map<string, GameObject> = new Map<string, GameObject>();
    public glassesOrignMap:Map<string, GameObject> = new Map<string, GameObject>();
    public ballonMap:Map<string, GameObject> = new Map<string, GameObject>();
    public ballonOrignMap:Map<string, GameObject> = new Map<string, GameObject>();
    public wingMap:Map<string, GameObject> = new Map<string, GameObject>();
    public wingOrignMap:Map<string, GameObject> = new Map<string, GameObject>();
    public multiplay: ZepetoWorldMultiplay;
    public room: Room;
    public static player:Player;
    private handObj:GameObject;
    public balloon:GameObject;
    private glasses_ORIGIN:GameObject;
    public glasses:GameObject;
    private wing_ORIGIN:GameObject;
    public wing:GameObject;
    public car:GameObject;

    public photozone:boolean;
    public onTarget:boolean;

    __resource:ResourcesManager = new ResourcesManager();
    // _resource:ResourceManager = new ResourceManager();
    // _ui:UIManager = new UIManager();
    __ui:UIManagers = new UIManagers();
    
    public static Resource():ResourcesManager {return this.Instance.__resource;}
    public static get UI():UIManagers{ return this.Instance.__ui;}
    public static Room():Room{return GameManager.Instance.room;}
    // public static SetPlayer(player:Player){
    //     GameManager.Instance.player = player;
    // }
    //public static GetPlayer():Player{return GameManager.Instance.player;}
    public static GetGlasses(sessionId:string):boolean{return GameManager.Instance.glassesMap.has(sessionId);}
    public static GetBalloon(sessionId:string):boolean{return GameManager.Instance.ballonMap.has(sessionId);}
    public static GetWing(sessionId:string):boolean{return GameManager.Instance.wingMap.has(sessionId);}

    Awake() {    
        GameManager.Instance = this;
        
        GameManager.Instance.__ui.Init();
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
            GameManager.Instance.__ui.RoomInit(this.room);
            this.room.AddMessageHandler("QuestDelay",(message: string)=>{
                // print server message
                let _message = message.toString();
                this.StartCoroutine(this.Delay2(_message));
            });
        };
    }

    Start(){
        
    }

    public HoldSomething(obj:string){
        let handTs = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(3).GetChild(1).GetChild(1)
        .GetChild(0).GetChild(1).GetChild(0);

        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isHoldCan", true);
        if(obj == "PetLemon"){
            this.StartCoroutine(this.Delay("5"));
        }
        else if(obj == "PetKiwi"){
            this.StartCoroutine(this.Delay("11"));
        }
        else if(obj == "PetOrange"){
            this.StartCoroutine(this.Delay("17"));
        }

        
        if(this.handObj == null)
            this.handObj = GameManager.Resource().Instantiate(obj, handTs);
        else
        {
            GameManager.Resource().Destroy(this.handObj);
            this.handObj = GameManager.Resource().Instantiate(obj, handTs);
        }
        this.handObj.transform.localPosition = this.handObj.transform.localPosition + new Vector3(0.062, 0.04, -0.01);
        this.handObj.transform.localRotation = this.handObj.transform.localRotation * Quaternion.Euler(-90,0,0);
        
    }

    public DestroyHandObj(){
        GameManager.Resource().Destroy(this.handObj);
    }

    public WearGlasses(sessionId:string){
        let glasses = this.glassesMap.get(sessionId);
        let glassesOri  = this.glassesOrignMap.get(sessionId);
        if(glasses != null){
            if(glasses.activeSelf == true){
                return;
            }
            else{
                glasses.SetActive(true);
                if(this.room.SessionId == sessionId){
                    this.room.Send("Glasses", true);
                }
                if(glassesOri != null)
                    glassesOri.SetActive(false);
                return;
            }
        }
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        
        let glassTr:Transform;
        let _glassTr = zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0).GetComponentsInChildren<Transform>();

        for(let i = 0; i < _glassTr.length; i++){
            if(_glassTr[i].transform.gameObject.name.startsWith("GLASSES") || _glassTr[i].transform.gameObject.name.startsWith("SUNGLASSES")){
                glassTr = _glassTr[i].transform;
                this.glassesOrignMap.set(sessionId, _glassTr[i].transform.gameObject);
                _glassTr[i].transform.gameObject.SetActive(false);
            }
            else{
                glassTr  = zepetoPlayer.character.transform.GetChild(0).
                GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0);
            }
        }
        let __glasses = GameManager.Resource().Instantiate("Glasses", glassTr);
        __glasses.transform.localPosition = __glasses.transform.localPosition + new Vector3(0, 0.04, 0);
        this.glassesMap.set(sessionId, __glasses);
        
        if(this.room.SessionId == sessionId){
            this.room.Send("Glasses", true);
        }
        
    }

    public WearBalloon(sessionId:string){
        
        let balloon = this.ballonMap.get(sessionId);
        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

        let handTs = zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(2).GetChild(1).GetChild(1)
        .GetChild(0).GetChild(1).GetChild(0);

        if(balloon == null){
            let __balloon = GameManager.Resource().Instantiate("Balloon", handTs);
            
            __balloon.transform.localPosition = new Vector3(-0.117414, 0.11844, -0.08346);
            __balloon.transform.localRotation = Quaternion.Euler(-13.219, 82.838, -119.737);

            this.ballonMap.set(sessionId, __balloon);
        }
        else{
            if(balloon.activeSelf == true){
                return;
            }
            else{
                balloon.SetActive(true);
                this.room.Send("Balloon", true);
                return;
            }
        }
        if(this.room.SessionId == sessionId){
            this.room.Send("Balloon", true);
        }

        
    }

    public WearWing(sessionId:string){
        
        let wing = this.wingMap.get(sessionId);
        let wingOri = this.wingOrignMap.get(sessionId);
        if(wing != null){
            if(wing.activeSelf == true){
                //this.room.Send("Wing", true);
                return;
            }
            else{
                wing.SetActive(true);
                if(this.room.SessionId == sessionId){
                    this.room.Send("Wing", true);
                }
                if(wingOri != null){
                    wingOri.SetActive(false);
                }
                return;
            }
        }
        else{

        }

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);

        let wingTr:Transform;
        wingTr = zepetoPlayer.character.transform.GetChild(0).
        GetChild(1).GetChild(2).GetChild(0).GetChild(1);
        let _wingTr = zepetoPlayer.character.transform.GetChild(0).
        GetChild(0).GetComponentsInChildren<Transform>();

        for(let i = 0; i < _wingTr.length; i++){
            if(_wingTr[i].transform.gameObject.name.startsWith("WING")){
                let __wing = _wingTr[i].transform.gameObject;
                __wing.SetActive(false);
                this.wingOrignMap.set(sessionId, __wing);
            }
           
        }

        
        let wingObj = GameManager.Resource().Instantiate("Wing", wingTr);
        this.wingMap.set(sessionId, wingObj);

        if(this.room.SessionId == sessionId){
            this.room.Send("Wing", true);
        }
        
    }

    public TurnOffObj(name:string, sessionId:string){
        if(name == "glasses"){
            let glasses  = this.glassesOrignMap.get(sessionId);
            let curGlasses = this.glassesMap.get(sessionId);
            if(glasses != null){
                glasses.gameObject.SetActive(true);
            }
            curGlasses.SetActive(false);
            if(sessionId == this.room.SessionId)
                this.room.Send("Glasses", false);
        }
        else if(name == "balloon"){
            let balloon  = this.ballonOrignMap.get(sessionId);
            let curballoon = this.ballonMap.get(sessionId);
            if(balloon != null){
                balloon.gameObject.SetActive(true);
            }
            curballoon.SetActive(false);
            if(sessionId == this.room.SessionId)
                this.room.Send("Balloon", false);
        }
        else{
            let wing  = this.wingOrignMap.get(sessionId);
            let curwing = this.wingMap.get(sessionId);
            if(wing != null){
                wing.gameObject.SetActive(true);
            }
            curwing.SetActive(false);
            if(sessionId == this.room.SessionId)
                this.room.Send("Wing", false);
        }
    }

    public RideCar(){
        let controller = ZepetoPlayers.instance.gameObject.GetComponentInChildren<UIZepetoPlayerControl>();
        let joystick = controller.transform.GetChild(0).GetChild(3).gameObject.GetComponent<JoystickDir>();
        controller.transform.GetChild(0).GetChild(1).gameObject.SetActive(false);
        controller.transform.GetChild(0).GetChild(3).gameObject.SetActive(true);
        this.car = GameManager.Resource().Instantiate("Car");
        joystick.carCtrl = this.car.GetComponent<CarCtrl>();
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(this.car.transform);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.enabled = false;

        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localPosition = new Vector3(-0.303, 0, 0.034);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localRotation = Quaternion.identity
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", true);
        this.__ui.carOffBtn.gameObject.SetActive(true);

        this.room.Send("Ride", true);
    }

    public OffCar(){
        let controller = ZepetoPlayers.instance.gameObject.GetComponentInChildren<UIZepetoPlayerControl>();
        
        controller.transform.GetChild(0).GetChild(1).gameObject.SetActive(true);
        controller.transform.GetChild(0).GetChild(3).gameObject.SetActive(false);
        
        
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.SetParent(null);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.characterController.enabled = true;
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isDrive", false);
        GameManager.Resource().Destroy(this.car);
        this.car = null;

        this.room.Send("Ride", false);
        // ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localPosition = Vector3.zero;
        // ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.localRotation = Quaternion.identity
    }

    public LeavePlayer(sessionId:string){
        this.glassesMap.delete(sessionId);
        this.glassesOrignMap.delete(sessionId);
        this.ballonMap.delete(sessionId);
        this.ballonOrignMap.delete(sessionId);
        this.wingMap.delete(sessionId);
        this.wingOrignMap.delete(sessionId);
    }

    *Delay(num:string){
        //&& ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.GetCurrentAnimatorStateInfo(0).normalizedTime >= 1
        yield new WaitForSeconds(3);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isHoldCan", false);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetTrigger("isDrink");
        yield new WaitForSeconds(1);
        GameManager.UI.ShowUI(num, 1)   
    }

    *Delay2(num:string){
        yield new WaitForSeconds(1);
        GameManager.UI.ShowUI(num, 1)
    }



    // public SendRoomMessage<T>(type:string, message:T){
    //     this.room.Send(type, message);
    // }

}