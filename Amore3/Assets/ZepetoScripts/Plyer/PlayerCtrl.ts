import { CapsuleCollider, LayerMask, Rigidbody, Vector3} from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World'

export default class PlayerCtrl extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;
    layerMask_Player: number = 1 << LayerMask.NameToLayer("Player");
    Start() {
        this.StartCoroutine(this.FindCharacter());
       
    }

    *FindCharacter() {
        while (true) {
            
            if (this.multiplay.Room != null && this.multiplay.Room.IsConnected ) {
                if (this.transform.parent != null) {
                    this.transform.parent.gameObject.tag = "Player";
                    this.transform.parent.gameObject.layer = 23;
                    let capCol = this.transform.parent.gameObject.AddComponent<CapsuleCollider>();
                    capCol.center = new Vector3(0, 0.6, 0);
                    capCol.radius = 0.23;
                    capCol.height = 1.2;
                    capCol.isTrigger = true;
                    capCol.enabled = false;
                    let rbod = this.transform.parent.gameObject.AddComponent<Rigidbody>();
                    rbod.useGravity = false;
                    rbod.isKinematic = true;
                    return;
                }
            }
            yield null;
        }
    }

}