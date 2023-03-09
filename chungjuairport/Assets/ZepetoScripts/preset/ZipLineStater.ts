import { Compute_DistanceTransform_EventTypes } from 'TMPro';
import { Collider, GameObject, Transform, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class ZipLineStater extends ZepetoScriptBehaviour {
    //public _pointNum : number;
    public _speed : number;
    public points : Transform[];
    //public _end : GameObject;
    OnTriggerEnter(coll : Collider){
        if(coll.gameObject.tag === "Player"){
            GameManager.instance.ZipRide(this.points, this._speed);
            //coll.gameObject.transform.GetComponentInChildren<PlayerCtrl>().ZipLine(this._pointNum, _start_position, _end_position);
        }
    }
}