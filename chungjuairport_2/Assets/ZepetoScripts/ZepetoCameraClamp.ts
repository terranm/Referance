import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoPlayers} from "ZEPETO.Character.Controller";
import {Mathf, Quaternion, Vector3, Vector2, Time, Input} from 'UnityEngine'

export default class ZepetoCameraClamp extends ZepetoScriptBehaviour {
    public speed: number;
    public isInit: boolean;

    private min : number;
    private max : number;

    public Init(min, max, speed)
    {
        this.min = min;
        this.max = max;
        this.speed = speed;
        console.log(`min : ${this.min}, max : ${this.max}, speed : ${this.speed}`);
        this.isInit = true;
    }

    LateUpdate() {

        if (this.isInit) {

            var angleY = this.ClampAngle(this.transform.eulerAngles.y, this.min, this.max);
            console.log(angleY);
            
            //this.transform.rotation = Quaternion.Euler(new Vector3(this.transform.eulerAngles.x, angleY, this.transform.eulerAngles.z));
            
            var a = this.transform.rotation;
            var b = Quaternion.Euler(new Vector3(this.transform.eulerAngles.x, angleY, this.transform.eulerAngles.z));
            this.transform.rotation = Quaternion.Lerp(a, b, Time.deltaTime * this.speed);

        }

    }

    ClampAngle(current, min, max) {
        var dtAngle = Mathf.Abs(((min - max) + 180) % 360 - 180);
        var hdtAngle = dtAngle * 0.5;
        var midAngle = min + hdtAngle;

        var offset = Mathf.Abs(Mathf.DeltaAngle(current, midAngle)) - hdtAngle;
        if (offset > 0)
            current = Mathf.MoveTowardsAngle(current, midAngle, offset);
        return current;
    }
}