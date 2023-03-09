import { Collider, Transform } from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class Portal extends ZepetoScriptBehaviour {

    public returnTr:Transform;

    Start() {    

    }

    OnTriggerEnter(col:Collider){
        if(col.gameObject.tag == "Player"){
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(this.returnTr.position, this.returnTr.rotation);
        }
    }
}