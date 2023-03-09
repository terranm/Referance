import { Collider, GameObject } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class BtnOnOffTrigger extends ZepetoScriptBehaviour {
    public btnList : GameObject[];

    Start() {
        for(let i = 0; i < this.btnList.length; i++){
            this.btnList[i].SetActive(false);
        }
    }

    OnTriggerEnter(col:Collider){
        if (col.transform.tag == "Player"){ //console.log("in" + col.transform.name);
            for(let i = 0; i < this.btnList.length; i++){
                this.btnList[i].SetActive(true);
            }
        }
    }

    OnTriggerExit(col:Collider){
        if (col.transform.tag == "Player"){
            for(let i = 0; i < this.btnList.length; i++){
                this.btnList[i].SetActive(false);
            }
        }
    }
}