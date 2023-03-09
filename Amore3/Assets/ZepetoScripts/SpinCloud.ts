import { Time, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class SpinCloud extends ZepetoScriptBehaviour {

    public speed: number;

    Update() {
        this.transform.Rotate(Vector3.up * this.speed * Time.deltaTime);
    }

}