import { BoxCollider, Canvas, GameObject, Transform, WaitForSeconds } from 'UnityEngine';
import { Analytics } from 'UnityEngine.Analytics';
import { Button } from 'UnityEngine.UI';
import { AnalyticsType, ZepetoAnalyticsComponent } from 'ZEPETO.Analytics';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import ClientStarter from '../../ZepetoScripts/Multiplay/ClientStarter';
import UIManager from './UIManager';

export default class GameManager extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: GameManager;
    public static get instance(): GameManager { return GameManager._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public multiplay : ZepetoWorldMultiplay;
    private room : Room;

    public analytics : ZepetoAnalyticsComponent;
    public canvas:Canvas;
    private buttons:Button[];
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Awake()
    {
        GameManager._instance = this;

        this.multiplay.RoomCreated += (room : Room) => {
            this.room = room;
        };
    }
    Start()
    {
        const loadingUI = UIManager.instance.FindLoadingImage(UIManager.instance.LOADING_START);
        if(loadingUI != null)
            this.StartCoroutine(this.StartLoading(loadingUI));

        this.buttons = this.canvas.GetComponentsInChildren<Button>();
        if(this.buttons == null || this.buttons.length < 1)
            return;
        
        for(let i=0; i<this.buttons.length; i++)
        {
            console.log(i);
            
            this.buttons[i].onClick.AddListener( () => this.AnalyticsButton(i) );
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading Image Start
    private * StartLoading(loadingUI:GameObject)
    {
        let isLoading = true;
        loadingUI.SetActive(true);

        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        
        while (isLoading)
        {
            yield new WaitForSeconds(2);
            if (this.room != null && this.room.IsConnected)
            {
                if (ZepetoPlayers.instance.HasPlayer(this.room.SessionId))
                {
                    isLoading = false;
                    loadingUI.SetActive(false);
                    ZepetoPlayers.instance.controllerData.inputAsset.Enable();
                    this.StopCoroutine(this.StartLoading(loadingUI));
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading Image END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast Button Start
    SwitchButtonScript(btn : Transform)
    {
        if(this.room == null)
            this.room = ClientStarter.instance.clientRoom;              // ?

        let names = btn.name.split(`_`);                // 이름 분할로 인한 스크립트 분류   ex) Button_Speed => ButtonScript_SpeedUp
        switch(names[names.length-1])
        {
            case "Chair" :
                this.ButtonScript_PlayerSitDown(btn);
                break;
            default :
                console.error(`이름이 설정되지 않은 버튼이 있습니다. ${names[names.length-1]}`)
                return;
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////// Sit Chair
    ButtonScript_PlayerSitDown(trans : Transform)
    {
        let chair = trans.parent.parent;
        chair.GetComponent<BoxCollider>().enabled = false;
        chair.GetChild(2).gameObject.SetActive(false);

        let sitPosition = chair.GetChild(1);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(sitPosition.position, sitPosition.rotation);
        this.StartCoroutine(this.StartContinuousAnimation());
    }

    private * StartContinuousAnimation()
    {
        const anim = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator;
        console.log(anim.GetBool("isSit"));
        
        while(anim.GetBool("isSit"))
        {
            yield null;
        }
        anim.SetBool("isSit", true);
        
        console.log(anim.name);
        console.log(anim.GetBool("isSit"));
    }

    PlayerSitOut(trans : Transform)
    {
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isSit", false);
        
        let chair = trans.parent;
        chair.GetComponent<BoxCollider>().enabled = true;
        chair.GetChild(2).gameObject.SetActive(true);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////// Sit Chair END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast Button END

    count:number = 0;
    AnalyticsButton(num:number)
    {
        switch(num)
        {
            case 0:
                this.AnalyticsButton1(true);
                break;
            case 1:
                this.AnalyticsButton1(false);
                break;
            case 2:
                this.AnalyticsButton2();
                break;
            case 3:
                this.AnalyticsButton3();
                break;
            case 4:
                this.AnalyticsButton4();
                break;
            case 5:
                this.AnalyticsButton5();
                break;
        }
        
    }

    AnalyticsButton1(isCanvas:boolean)
    {
        const param = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.userId;
        const count = isCanvas ? --this.count : ++this.count;

        const google = this.analytics.Analytics(AnalyticsType.GoogleAnalytics);
        interface CustomEvent
        {
            param1 : string;
            param2 : number;
        }
        const eventParams:CustomEvent = {
            param1 : param,
            param2 : count,
        };
        google.LogEvent<CustomEvent>("TEST_Analytics", eventParams);    // event 이름은 빈칸이 없어야함 ex) TEST Analytics
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log(eventParams.param2);
    }

    AnalyticsButton2()
    {
        const google = this.analytics.Analytics(AnalyticsType.GoogleAnalytics);
        interface CustomEvent
        {
            param1 : string;
            param2 : number;
        }
        var _event1 : CustomEvent = {
            param1 : null,
            param2 : 3,
        }
        google.LogEvent<CustomEvent>("custom_sub_param", _event1);      // 리포트에는 event 이름으로 구분되어 저장된다
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log("param1 : null");
    }

    AnalyticsButton3()
    {
        const google = this.analytics.Analytics(AnalyticsType.GoogleAnalytics);
        interface CustomEvent
        {
            param2 : number;
        }
        var _event2 : CustomEvent = {
            param2 : 3,
        }
        google.LogEvent<CustomEvent>("custom_sub_param", _event2);     // event 이름이 같으면 property 개수가 달라도 된다
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log("param2 : number");
    }
    
    AnalyticsButton4()
    {
        const google = this.analytics.Analytics(AnalyticsType.GoogleAnalytics);
        interface CustomEvent3
        {
            param2 : string;
        }
        var _event3 : CustomEvent3 = {
            param2 : "penguins",
        }
        google.LogEvent<CustomEvent3>("custom_sub_param", _event3);   // event 이름이 같으면 property 타입이 달라도 된다
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log("param2 : string");
    }
    
    AnalyticsButton5()
    {
        const google = this.analytics.Analytics(AnalyticsType.GoogleAnalytics);
        interface CustomEvent3
        {
            param2 : string;
        }
        var _event3 : CustomEvent3 = {
            param2 : "10",
        }
        google.LogEvent<CustomEvent3>("TEST_Analytics", _event3);   // property 타입은 string으로 저장된다
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        console.log("param2 : string (number)");
    }
}