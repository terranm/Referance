import { Animator } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class NPC extends ZepetoScriptBehaviour {

    public anim: Animator;

    Start() {    
        this.anim.SetBool("MakeUp", true);
    }

}