import { Collider, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerCtrl from './PlayerCtrl';

export default class Teleport extends ZepetoScriptBehaviour {
    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag === "Player"){
            coll.gameObject.transform.GetComponentInChildren<PlayerCtrl>().Teleport(new Vector3(-29,66,-123));
        }
    }
}