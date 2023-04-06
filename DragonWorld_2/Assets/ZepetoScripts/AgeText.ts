import { TextMesh, WaitForSeconds } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import PlayerSync from './MultiplaySync/Player/PlayerSync'

export default class AgeText extends ZepetoScriptBehaviour {

    private cnt:number;
    private textMesh : TextMesh;

    Start() {
        this.textMesh = this.gameObject.GetComponent<TextMesh>();
        this.StartCoroutine(this.TextMeshUpdate());
    }
    private *TextMeshUpdate(){
        while(true){
            yield new WaitForSeconds(5);
            const playerSync = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetComponent<PlayerSync>();
            console.log("TextMesh player age : " + playerSync.player.age); 
            this.textMesh.text = "age : " + playerSync.player.age.toString();
            console.log("TextMesh : " +this.textMesh.text);
        } 
        this.StopCoroutine(this.TextMeshUpdate());
    }
}