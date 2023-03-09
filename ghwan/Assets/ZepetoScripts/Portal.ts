import { Collider, GameObject, Transform, WaitForSeconds } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class Portal extends ZepetoScriptBehaviour {

    public point:Transform;

    OnTriggerEnter(col: Collider) {
        if(col.gameObject.tag == "Player"){
            //this.StartCoroutine(this.Teleport(col.gameObject));
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(this.point.transform.position,this.point.transform.rotation);
        }
    }

    // *Teleport(obj:GameObject){
    //     for(let i = 0; i < 7; i++){
    //         yield new WaitForSeconds(0.01)
    //         obj.gameObject.transform.position = this.point.transform.position;
    //         obj.gameObject.transform.rotation = this.point.transform.rotation;
    //     }
    // }

}