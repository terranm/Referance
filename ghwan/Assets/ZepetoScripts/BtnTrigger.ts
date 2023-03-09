import { Collider, GameObject } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export enum PositionType {
    startPoint,
    cf,
    quest,
    lemonQuest2,
    bridge,
    car
}

export default class BtnTrigger extends ZepetoScriptBehaviour {
    public positionType:PositionType;
    public btnObj:GameObject[];
    public lemonBtn:GameObject;
    public wall:GameObject[];
    public carBtn:GameObject;

    Start() {    
        if(this.positionType == PositionType.cf){
            for(let i = 0; i < this.btnObj.length; i++){
                this.btnObj[i].SetActive(false);
            }
        }
        else if(this.positionType == PositionType.quest){
            this.lemonBtn.SetActive(false);
        }
        else if(this.positionType == PositionType.car){
            this.carBtn.SetActive(false);
        }
        
    }

    OnTriggerEnter(col:Collider){
        if(col.gameObject.tag == "Player" && this.positionType == PositionType.cf){
            for(let i = 0; i < this.btnObj.length; i++){
                this.btnObj[i].SetActive(true);
            }
        }
        else if(col.gameObject.tag == "Player" && this.positionType == PositionType.startPoint){
            GameManager.UI.ShowUI(GameManager.player.quest.toString(), 1);
        }
        else if(col.gameObject.tag == "Player" && this.positionType == PositionType.quest){
            let questLevel = GameManager.player.quest;
            if((questLevel+=1) ==  parseInt(this.transform.GetChild(0).name))
                this.lemonBtn.SetActive(true);
        }
        else if(col.gameObject.tag == "Player" && this.positionType == PositionType.bridge){
            let questLevel = GameManager.player.quest;
            if(questLevel >= 19){
                for(let i = 0; i < this.wall.length; i++){
                    this.wall[i].SetActive(false);
                }
            }
            else{
                GameManager.UI.ShowUI("x2", 1);
            }
        }
        else if(col.gameObject.tag == "Player" && this.positionType == PositionType.car){
            this.carBtn.SetActive(true);
        }
    }

    OnTriggerExit(col:Collider){
        if(col.gameObject.tag == "Player"&& this.positionType == PositionType.cf){
            for(let i = 0; i < this.btnObj.length; i++){
                this.btnObj[i].SetActive(false);
            }
        }
        else if(col.gameObject.tag == "Player" && this.positionType == PositionType.quest){
            this.lemonBtn.SetActive(false);
        }
        else if(col.gameObject.tag == "Player" && this.positionType == PositionType.car){
            this.carBtn.SetActive(false);
        }
    }

}