import { TextMesh, WaitForSeconds } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Users, ZepetoWorldHelper } from 'ZEPETO.World';
import PlayerSync from './MultiplaySync/Player/PlayerSync'

export default class AgeText extends ZepetoScriptBehaviour {

    private cnt:number;
    private textMesh : TextMesh;

    Start() {
        this.textMesh = this.gameObject.GetComponent<TextMesh>();
        this.StartCoroutine(this.TextMeshUpdate());
    }
    private *TextMeshUpdate(){
        let zepetoId = "";
        while(true){
            this.textMesh.text = "Name : " + zepetoId;
            yield new WaitForSeconds(5);
            let tempUserIds = new Array();
            tempUserIds.push(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.userId);
            ZepetoWorldHelper.GetUserIdInfo(tempUserIds,(info:Users[])=>{
                zepetoId = info[0].name;
                console.log(zepetoId + " : " + info[0].name + " // " + info[0].zepetoId + " // " + info[0].userOid);
            },(err)=>{
                console.error(err);
            });
            // this.textMesh.text = "Name : " + zepetoId.toString();
            console.log(this.textMesh.text);
        } 
        this.StopCoroutine(this.TextMeshUpdate());
    }
}