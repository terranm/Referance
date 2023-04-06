import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoWorldContent, ZepetoWorldMultiplay } from 'ZEPETO.World';
import { Collider,Vector3,Quaternion, Light, GameObject , Object } from 'UnityEngine';
import { ZepetoCharacter, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoChat } from 'ZEPETO.Chat';
import { Room } from 'ZEPETO.Multiplay';

export default class TimeLightBtn extends ZepetoScriptBehaviour {

    public Light : GameObject;
    public time : number;

    private zepetoCharacter: ZepetoCharacter;
    
    private multiplay: ZepetoWorldMultiplay;
    private room: Room;

    Start() {
        this.multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this.multiplay.RoomJoined += (room: Room) => {
            this.room= room;
            this.room.AddMessageHandler("ServerTime", (servertime : number) => {
                //If there is a real-time physical conflict, such as a soccer ball, change the update owner directly.
                this.Light.transform.rotation.eulerAngles.x = servertime * 0.25;
                // this.m_tfHelper.ChangeOwner(OwnerSessionId.toString());
            });
        }
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });
    }

    OnTriggerEnter(collider: Collider) {
        if ((this.zepetoCharacter == null) || (collider.gameObject != this.zepetoCharacter.gameObject)) {
            return;
        }
        // ZepetoChat.Send("Time Spend + 90M // now SunAngle : " + this.Light.transform.rotation.eulerAngles.x);
        this.Light.transform.Rotate(0.25*90,0,0);
        this.time = this.Light.transform.rotation.eulerAngles.x * 4;
        if (270 < this.Light.transform.eulerAngles.x && this.Light.transform.eulerAngles.x < 360){
            this.time -= 1080;
        }
        if (0 < this.Light.transform.eulerAngles.x && this.Light.transform.eulerAngles.x < 270){
            this.time += 360;
        }
        // ZepetoChat.Send("Time Spend + 90M // now SunAngle : " + this.Light.transform.rotation.eulerAngles.x + " // now Time : " + this.time);
        this.room.Send("ServerTime", this.time);
    }

}