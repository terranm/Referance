import { GameObject, Mathf, Time, Vector2, Vector3, WaitForFixedUpdate, WaitForSeconds } from 'UnityEngine';
import { BaseEventData, EventTrigger, EventTriggerType, PointerEventData } from 'UnityEngine.EventSystems';
import { Entry } from 'UnityEngine.EventSystems.EventTrigger';
import { ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import PlayerCtrl from './PlayerCtrl';

export default class JoystickDir extends ZepetoScriptBehaviour {

    private stickFirstPos: Vector3;
    private stickFirstPos2: Vector3;
    public player:GameObject;
    public joyVec: Vector3 = Vector3.zero;   
    
    private isPointerDown:boolean = false;
    public staticR:GameObject;
    private jumpBtn:GameObject;
    private multiplay:ZepetoWorldMultiplay;
    private playerCtrl: PlayerCtrl;

    Start() {    
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        this.staticR = this.transform.parent.GetChild(3).gameObject;
        this.jumpBtn = this.transform.parent.GetChild(2).gameObject;
        var trigger = this.gameObject.GetComponent<EventTrigger>();
        var trigger2 = this.transform.parent.GetChild(2).GetComponent<EventTrigger>();
        var trigger3 = this.transform.parent.GetChild(3).GetComponent<EventTrigger>();
        //왼쪽 조이스틱
        var entry_PointerDown = new Entry();
        var entry_BeginDrag = new Entry();
        var entry_Drag = new Entry();
        var entry_DragEnd = new Entry();
        //오른쪽
        var entry_PointerDown2 = new Entry();
        var entry_PointerUp = new Entry();
        //오른쪽 조이스틱
        var entry_PointerDown3 = new Entry();
        var entry_BeginDrag2 = new Entry();
        var entry_Drag2 = new Entry();
        var entry_DragEnd2 = new Entry();

        entry_PointerDown.eventID = EventTriggerType.PointerDown;
        entry_PointerDown2.eventID = EventTriggerType.PointerDown;
        entry_PointerDown3.eventID = EventTriggerType.PointerDown;
        entry_BeginDrag.eventID = EventTriggerType.BeginDrag; 
        entry_BeginDrag2.eventID = EventTriggerType.BeginDrag; 
        entry_Drag.eventID = EventTriggerType.Drag;
        entry_Drag2.eventID = EventTriggerType.Drag;
        entry_DragEnd.eventID = EventTriggerType.EndDrag;
        entry_DragEnd2.eventID = EventTriggerType.EndDrag;
        entry_PointerUp.eventID = EventTriggerType.PointerUp;
        

        entry_BeginDrag.callback.AddListener((event: BaseEventData) =>
        {
          
        })

        entry_Drag.callback.AddListener((event: PointerEventData ) =>
        {
            
            this.Drag(true, event);
            
        })

        entry_Drag2.callback.AddListener((event: PointerEventData ) =>
        {
            this.Drag(false, event);
        })

        entry_DragEnd.callback.AddListener(() =>
        {
           
            //jetpack
            this.playerCtrl.steer = 0;
            this.playerCtrl.isMove = false;
            this.playerCtrl.isBack = false;
           
        })

        entry_DragEnd2.callback.AddListener(() =>
        {
            //오른쪽 조이스틱 드래그가 끝나면 
            this.playerCtrl.isUp  = false;
            this.playerCtrl.isDown = false;
           
        })

        entry_PointerDown.callback.AddListener((event: PointerEventData)=>{
            //처음 터치한 포지션값 대입
            //타입스크립트에서 Vector2 to 3로 자동 변환이 되지 않아서 따로 변환하는 함수 제작
            this.stickFirstPos = this.ConvertVector3(event.position);
        })
       
        entry_PointerDown3.callback.AddListener((event: PointerEventData)=>{
            this.stickFirstPos2 = this.ConvertVector3(event.position);
        })

        entry_PointerUp.callback.AddListener((event:PointerEventData)=>{
            console.log("Up");
            this.isPointerDown = false;
        });

        trigger.triggers.Add(entry_BeginDrag);
        trigger.triggers.Add(entry_Drag);
        trigger.triggers.Add(entry_DragEnd);
        trigger.triggers.Add(entry_PointerDown);
        trigger2.triggers.Add(entry_PointerDown2);
        trigger2.triggers.Add(entry_PointerUp);
        trigger3.triggers.Add(entry_BeginDrag2);
        trigger3.triggers.Add(entry_Drag2);
        trigger3.triggers.Add(entry_DragEnd2);
        trigger3.triggers.Add(entry_PointerDown3);

        this.staticR.SetActive(false);

        this.StartCoroutine(this.FindCharacter());
    }

    * FindCharacter(){
        while (true) {
            yield null;

            if (this.multiplay != null && this.multiplay.Room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.multiplay.Room.SessionId);
                    this.playerCtrl = myPlayer.character.transform.GetChild(1).GetComponent<PlayerCtrl>();
                    if(this.playerCtrl != null){
                        this.playerCtrl.event.AddListener((ride:number)=>{
                            if(ride == 0){
                                this.staticR.SetActive(true);
                                this.jumpBtn.SetActive(false);
                                //캐릭터 생성시 자동으로 부착되는 ZepetoCharacter스크립트를 끔 이 스크립트가 켜져 있으면 캐릭터의 애니메이션과 회전값이 변경되지 않음
                                ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = false;
                            }
                            else{
                                ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.enabled = true;
                                this.staticR.SetActive(true);
                                this.jumpBtn.SetActive(true);
                            }
                            
                        });
                        console.log("Find");
                        return;
                    }
                }
            }
        }
    }

    ConvertVector3(num: Vector2) :Vector3
    {
        var vec = new Vector3(num.x, num.y, 0);
        return vec;
    }

  
    Drag(isLeft:boolean, event:PointerEventData){
        let pointerPos = this.ConvertVector3(event.position);
       
        //jetPack
        if(isLeft){
            let joyVec = (pointerPos - this.stickFirstPos).normalized;
            if(joyVec.y > 0){
                this.playerCtrl.isMove = true;
                this.playerCtrl.isBack = false;
            } 
            else{
                this.playerCtrl.isMove = false;
                this.playerCtrl.isBack = true;
            }
            
            this.playerCtrl.steer = joyVec.x;
        }
        if(!isLeft){
            let joyVec2 = (pointerPos - this.stickFirstPos2).normalized;
            this.playerCtrl.GLIDER_FLY = true;
            if(joyVec2.y > 0.25){
                this.playerCtrl.isUp = false;
                this.playerCtrl.isDown = true;
            } 
            else if(joyVec2.y < -0.25){
                this.playerCtrl.isUp = true;
                this.playerCtrl.isDown = false;
            }
        }

    }

}