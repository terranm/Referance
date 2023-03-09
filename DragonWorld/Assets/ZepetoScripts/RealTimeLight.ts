import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoWorldContent } from 'ZEPETO.World';
import { Collider,Vector3,Quaternion, Light, WaitForSeconds, Time } from 'UnityEngine';
import { ZepetoCharacter, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoChat } from 'ZEPETO.Chat';
import { AnalyticsResult } from 'UnityEngine.Analytics';

export default class RealTimeLight extends ZepetoScriptBehaviour {
    private date : Date;
    private hour : number;
    private minute : number;
    private second : number;
    private time : number;
    Start() {

        this.date = new Date();
        this.hour = this.date.getHours();
        this.minute = this.date.getMinutes();
        this.second = this.date.getSeconds();

        this.time = this.date.getHours() * 60 + this.date.getMinutes();
        console.log("h : " + this.date.getHours() + " m : " + this.date.getMinutes() + " time : " + this.time);
        this.transform.rotation = Quaternion.Euler(270,0,0);
        this.transform.Rotate(0.25 * this.time,0,0);
        // 90도     12 * 60 + 00 = 720 
        // 0도      06 * 60 + 00 = 360 
        // 180도    18 * 60 + 00 = 1080
        // 270도    24 * 60 + 00 = 1440 = 0
        // 50도    
            console.log("rotate11" + this.transform.rotation.eulerAngles.x); 
            this.timer = 0;
        // this.StartCoroutine(this.TimeLightUpdate());
    }

    // private * TimeLightUpdate(){
    //     while(true){
    //         yield new WaitForSeconds(6);
    //         console.log("rotate re" + this.transform.rotation.eulerAngles.x);
    //         // 0.25 = 60sec
    //         // 0.025 = 6sec
    //         this.transform.Rotate(0.025,0,0);
    //     }
    // }
    private timer : number;
    Update(){
        this.timer += Time.deltaTime;
        // console.log(this.timer);
        if (this.timer > 6){
            this.timer = 0;
            ZepetoChat.Send("Time Spend + 6sec // now SunAngle : " + this.transform.rotation.eulerAngles.x);
            this.transform.Rotate(0.025,0,0);
        }
    }
}