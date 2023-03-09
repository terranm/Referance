import { Compute_DistanceTransform_EventTypes } from 'TMPro';
import { Collider, GameObject, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerCtrl from './PlayerCtrl';

export default class ZipLine extends ZepetoScriptBehaviour {
    public _point : number;
    public _start : GameObject;
    public _end : GameObject;
    OnTriggerEnter(coll : Collider){
        let _start_position = this._point != 0 ? Vector3.zero : this._start.transform.position as Vector3;
        let _end_position = this._point != 0 ? Vector3.zero : this._end.transform.position as Vector3;
        if(coll.gameObject.tag === "Player"){
            coll.gameObject.transform.GetComponentInChildren<PlayerCtrl>().ZipLine(this._point, _start_position, _end_position);
            
        }
    }
}