import { BoxCollider, Collider } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class TableCollider extends ZepetoScriptBehaviour {
    public PassportCollider : BoxCollider;
    public DisembarkationCardCollider : BoxCollider;

    Start() {    
        this.PassportCollider.enabled = false;
        this.DisembarkationCardCollider.enabled = false;
    }

    OnTriggerEnter(col:Collider){
        this.PassportCollider.enabled = true;
        this.DisembarkationCardCollider.enabled = true;
    }

}