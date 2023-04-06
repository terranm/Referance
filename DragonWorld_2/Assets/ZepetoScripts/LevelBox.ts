import { Color, GameObject, Material, Mathf, MeshRenderer, WaitForSeconds } from 'UnityEngine'
import { Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import { Room } from 'ZEPETO.Multiplay'
import { ZepetoPlayer, ZepetoPlayers } from 'ZEPETO.Character.Controller';

export default class LevelBox extends ZepetoScriptBehaviour {

    public levelTxt : GameObject;
    private levelText : Text;
    public ExpTxt : GameObject;
    private expText : Text;
    

    public level : number;
    public exp : number;
    public totalexp : number;

    private mat : Material;

    private multiplay: ZepetoWorldMultiplay;
    private room: Room;
    Start() {    
        this.multiplay = GameObject.Find("WorldMultiplay").GetComponent<ZepetoWorldMultiplay>();
        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };


        this.mat = this.gameObject.GetComponent<MeshRenderer>().material
        let canvas = GameObject.Find("Canvas_UI");
        console.log("canvas " + canvas.name);
        this.levelTxt = canvas.transform.GetChild(0).gameObject;
        this.levelText = this.levelTxt.GetComponent<Text>();
        this.ExpTxt = canvas.transform.GetChild(1).gameObject;
        this.expText = this.ExpTxt.GetComponent<Text>();
        this.exp = 0;
        this.level = 1;
    }
    private player : ZepetoPlayer;
    /* Start Loading Player */
    private * StartLoading() {
        const wait = new WaitForSeconds(0.5);
        while (true) {
            yield wait;
            if (this.room != null && this.room.IsConnected && ZepetoPlayers.instance.HasPlayer(this.room.SessionId)) {
                this.player = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                this.StopCoroutine(this.StartLoading());
                this.expText.text = "Exp : " + this.exp.toString() + " / " + (this.level * 10).toString();
                this.levelText.text = "Level : " + this.level.toString();
                break;
            }
        }
    }


    OnTriggerEnter(){
        this.mat.SetColor("_Color", this.ColorChange(this.mat.color));
        console.log(this.mat.color);
        this.ExpCheck();
    }

    private ColorChange(prevColor:Color){
        return new Color(this.ColorNumCheck(prevColor.r + 50 + (Math.random() * 100)),this.ColorNumCheck(prevColor.g + 50 + (Math.random() * 100)),this.ColorNumCheck(prevColor.b + 50 + (Math.random() * 100)));
    }
    
    private ColorNumCheck(num : number){
        if (num > 255){
            num -= 255
        }
        return num / 255;
    }

    private ExpCheck(){
        this.exp++;
        this.totalexp++;
        this.expText.text = "Exp : " + this.exp.toString() + " / " + (this.level * 10).toString();
        this.LevelCheck();
        this.room.Send("Exp", this.totalexp);
    }
    
    private LevelCheck(){
        while (this.exp >= this.level * 10){
            this.exp -= this.level * 10;
            this.expText.text = "Exp : " + this.exp.toString() + " / " + (this.level * 10).toString();
            this.level++;
        }
        this.levelText.text = "Level : " + this.level.toString();

    }

}
