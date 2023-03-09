import { Collider, GameObject } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class PhotozoneBtn extends ZepetoScriptBehaviour {

    public btn: GameObject;

    Start(){
        this.btn.SetActive(false);
    }

   OnTriggerEnter(other:Collider){
    if(other.gameObject.tag == "Player"){
        this.btn.SetActive(true);
    }
   }

   OnTriggerExit(other:Collider){
    if(other.gameObject.tag == "Player"){
        this.btn.SetActive(false);
    }
   }

}