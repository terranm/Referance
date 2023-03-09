import { BoxCollider, Collider, GameObject, Transform, Vector3 } from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ObjAttach from './ObjAttach';
import PlayerCtrl from './PlayerCtrl';

export default class AreaCloser extends ZepetoScriptBehaviour {
    public startPoint : Vector3;
    OnTriggerEnter(col : Collider){
        if(col.gameObject.tag == "Player"){
            let player = col.transform.GetComponentInChildren<PlayerCtrl>();
            if (player.isGetPassport && player.isGetDisembarkationCard && !player.isGame1Clear){
                console.log("통과1");
                player.isGame1Clear = true;
                let passportObj = player.transform.parent.GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(2).GetChild(1).GetChild(1).GetChild(0).GetChild(1).GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(0);
                let disembarkationCardObj = player.transform.parent.GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(2).GetChild(1).GetChild(1).GetChild(0).GetChild(1).GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(1);
                passportObj.GetComponent<ObjAttach>().ObjDestory();
                disembarkationCardObj.GetComponent<ObjAttach>().ObjDestory();
            }
            else if (!(player.isGetPassport && player.isGetDisembarkationCard)){
                this.startPoint = GameObject.Find("StartPoint").transform.position;
                player.Teleport(this.startPoint);
                console.log("여권을 챙기고, 입국신고서를 작성해주세요. "+
                    "\n" + col.gameObject.transform.position.x + ", " + col.gameObject.transform.position.y + ", " +col.gameObject.transform.position.z +
                    "\n" + this.startPoint.x + ", " + this.startPoint.y + ", " + this.startPoint.z);
            }
        }
    }
}