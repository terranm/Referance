import { Collider, GameObject, Vector3, WaitForSeconds } from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';

export default class UIOnOff extends ZepetoScriptBehaviour {


    public button: GameObject;
    public multiplay: ZepetoWorldMultiplay;
    public sit:boolean = false;
    Start() {    
        this.StartCoroutine(this.UICheck());
    }

    *UICheck(){
        while(true){
            yield new WaitForSeconds(0.1);
            if (this.multiplay.Room != null && this.multiplay.Room.IsConnected) {
                let has = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
                if (has) {
                    let player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject;
                    //let dist = Vector3.Distance(player.transform.position, this.button.transform.position);
                    let dist = (player.transform.position - this.transform.position).magnitude;
                    if(dist > 3  && !this.sit){
                        this.button.SetActive(false)
                        
                    } 
                    else if(dist < 3  && this.sit == true){
                        this.button.SetActive(false)
                    }
                    else if(dist < 3  && this.sit == false){
                        this.button.SetActive(true)
                        
                    }
                }
            }
        }
    }

    OnTriggerEnter(other: Collider) {
        if (other.gameObject.tag == "Player")
        {
            this.sit = true;
            this.button.SetActive(false);
        }
    }

    OnTriggerExit(other: Collider) {
        if (other.gameObject.tag == "Player") {
            this.sit = false;
            this.button.SetActive(true);
        }
    }
}