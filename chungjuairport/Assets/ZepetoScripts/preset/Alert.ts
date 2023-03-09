import { Collider, GameObject } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { Button } from "UnityEngine.UI";
import { UnityEvent, UnityEvent$3 } from "UnityEngine.Events";
import PlayerCtrl from "./PlayerCtrl";

export default class Alert extends ZepetoScriptBehaviour {
    public count = 0;
    public uiHitbox:GameObject;
    public event:PlayerCtrl;
    private popUp:GameObject;
    private button_OK:Button;
    private button_Cancel:Button;

    // //오브젝트에 닿을 시 count를 1 증가시킴
    // OnTriggerEnter(coll: Collider) {
    //     console.log(`OnTriggerEnter ${coll.gameObject.name}.`);
    //     this.count = this.count + 1;
    //     console.log(this.count);
    // }

    Start(){
        //this.event = new UnityEvent();
        this.popUp = this.transform.gameObject;
        this.button_OK = this.transform.GetChild(0).GetComponent<Button>();
        this.button_Cancel = this.transform.GetChild(1).GetComponent<Button>();

        //버튼을 누를 시 popUp GameObject를 비활성화
        this.button_OK.onClick.AddListener(() => {
            this.popUp.SetActive(false);
            this.event.CarStop();
            console.log(`button OK clicked`);
        })
        this.button_Cancel.onClick.AddListener(() => {
            this.popUp.SetActive(false);
            console.log(`button Cancel clicked`);
        })
        
    }

    // Update(){
    //     //count가 1일때 popUp GameObject를 활성화
    //     if(this.count == 1){
    //         this.popUp.SetActive(true);
    //         console.log(`shown`);
    //         this.count = this.count + 1;
    //     }
    // }
}