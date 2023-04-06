import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoWorldContent } from 'ZEPETO.World';
import { Collider,Vector3,Quaternion } from 'UnityEngine';
import { ZepetoCharacter, ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoChat } from 'ZEPETO.Chat';

export default class MoveToWorld extends ZepetoScriptBehaviour {

    private zepetoCharacter: ZepetoCharacter;
    private worldId: string = "com.METABUZZ.cyberworld"; // ex: com.default.jumpworld

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        });
    }

    OnTriggerEnter(collider: Collider) {
        if ((this.zepetoCharacter == null) || (collider.gameObject != this.zepetoCharacter.gameObject)) {
            return;
        }

        ZepetoChat.Send("Let's go to CyberWorld!");
        
        ZepetoWorldContent.MoveToWorld(this.worldId, (errCode, errMsg) => {
            // Example of error callback processing (When implementing , try to implement it in various ways, such as pop-up windows)
            console.log(`${errCode} - ${errMsg}`);
        });

        ZepetoChat.Send("Let's go to CyberWorld!!");
    }

}