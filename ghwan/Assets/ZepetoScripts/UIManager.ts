// import { GameObject, Resources, Sprite, Transform, WaitForSeconds } from 'UnityEngine';
// import { Button, Image } from 'UnityEngine.UI';
// import { Room } from 'ZEPETO.Multiplay';
// import GameManager from './GameManager';

// export default class UIManager{

//     private sprites: Map<string, Sprite> = new Map<string, Sprite>();
//     private spritesBtn: Map<string, Sprite> = new Map<string, Sprite>();
//     private popup:Map<string, GameObject> = new Map<string, GameObject>();
//     private room:Room;
//     private gameManager:GameManager;

//     private boolObj:GameObject = null;
//     private questUI:GameObject[];
//     private cfUI:GameObject[];
//     private iemtUI:GameObject;
//     public canvasObj:GameObject;

//     private cfImags: Sprite[];
//     private questImags:Sprite[];

    
//     public questUICloseBtn:Button;
//     public colseBtn:Button;
//     private itemColseBtn:Button;
//     private questBtn:Button;
//     private glassesBtn:Button;
//     private glassesOffBtn:Button;
//     private balloonBtn:Button;
//     private balloonOffBtn:Button;
//     private wingBtn:Button;
//     private wingOffBtn:Button;

//     public Init() {
//         this.gameManager = GameManager.GetInstance;
//         this.canvasObj = GameObject.Find("Canvas_UI").gameObject;
//         let questUI  = this.canvasObj.transform.GetChild(8).GetComponentsInChildren<Transform>();
//         let cfUI = this.canvasObj.transform.GetChild(7).GetComponentsInChildren<Transform>();
        
//         for(let i = 1; i < questUI.length; i++){
//             if(i % 2 == 1){
//                 this.popup.set(questUI[i].name, questUI[i].gameObject);
//                 questUI[i].gameObject.SetActive(false);
//             }
//             else{
//                 let btn = questUI[i].transform.GetComponent<Button>();
//                 if(questUI[i].transform.parent.name == "5" || questUI[i].transform.parent.name == "11" || questUI[i].transform.parent.name == "17"){
//                     btn.onClick.AddListener(()=>{
//                         this.ClosePopui(questUI[i].transform);
//                         if(GameManager.player.quest == 5){
//                             this.gameManager.WearGlasses();
//                             //GameManager.UI().ShowUI("6", 1);
//                             this.ShowUI("6",1);
//                             this.gameManager.DestroyHandObj();
//                             this.GetItem("glasses");
//                         }
//                         else if(GameManager.player.quest == 11){
//                             this.gameManager.WearBalloon();
//                             //GameManager.UI().ShowUI("12", 1);
//                             this.ShowUI("12", 1);
//                             this.gameManager.DestroyHandObj();
//                             this.GetItem("balloon");
//                         }
//                         else if(GameManager.player.quest == 17){
//                             this.gameManager.WearWing();
//                             //GameManager.UI.ShowUI("18", 1);
//                             this.ShowUI("18",1);
//                             this.gameManager.DestroyHandObj();
//                             this.GetItem("wing");
//                         }
//                     });
//                 }else{
//                     btn.onClick.AddListener(()=>{
//                         this.ClosePopui(questUI[i].transform);
//                     });
//                 }
//             }
            
//         }
//         for(let i = 1; i < cfUI.length; i++){
//             if(i % 2 == 1){
//                 this.popup.set(cfUI[i].name, cfUI[i].gameObject);
//                 cfUI[i].gameObject.SetActive(false);
//             }
//             else{
//                 let btn = cfUI[i].transform.GetComponent<Button>();
//                 btn.onClick.AddListener(()=>{
//                     this.ClosePopui(cfUI[i].transform);
//                 });
//             }
//         }
        
//         this.questBtn = this.canvasObj.transform.GetChild(0).GetComponent<Button>();
//         this.glassesBtn = this.canvasObj.transform.GetChild(5).GetComponent<Button>();
//         this.balloonBtn = this.canvasObj.transform.GetChild(3).GetComponent<Button>();
//         this.wingBtn = this.canvasObj.transform.GetChild(1).GetComponent<Button>();
//         this.glassesOffBtn= this.canvasObj.transform.GetChild(6).GetComponent<Button>();
//         this.balloonOffBtn= this.canvasObj.transform.GetChild(4).GetComponent<Button>();
//         this.wingOffBtn= this.canvasObj.transform.GetChild(2).GetComponent<Button>();

        
//         this.questBtn.onClick.AddListener(()=>{
//             let obj = this.popup.get(GameManager.player.quest.toString());
//             obj.SetActive(true);
//         });
        
//         this.glassesBtn.onClick.AddListener(()=>{
//             this.Glasses();
//         });
//         this.glassesOffBtn.onClick.AddListener(()=>{
//             this.Glasses();
//         });
//         this.balloonBtn.onClick.AddListener(()=>{
//             this.Balloon();
//         });
//         this.balloonOffBtn.onClick.AddListener(()=>{
//             this.Balloon();
//         });
//         this.wingBtn.onClick.AddListener(()=>{
//             this.Wing();
//         });
//         this.wingOffBtn.onClick.AddListener(()=>{
//             this.Wing();
//         });

//        this.glassesOffBtn.gameObject.SetActive(false);
//        this.balloonOffBtn.gameObject.SetActive(false);
//        this.wingOffBtn.gameObject.SetActive(false);
        
//     }


//     public RoomInit(room:Room){
//         this.room = room;    
       
//     }
    
//     // public StartUI(){
//     //     if(this.questUI.activeSelf == false){
//     //         this.questUI.SetActive(true);
//     //     }
//     // }

//     public ShowUI(name:string, level:number = null, delay:number = null){
        
//         // let image = this.sprites.get(name);
        
//         // if(level == null){
//         //     let _cfui = this.cfUI.GetComponent<Image>();
//         //     _cfui.sprite = image;
//         //     if(this.cfUI.activeSelf == false){
//         //         this.cfUI.SetActive(true);
//         //     }
//         // }
//         // else if(name == "5" || name == "11" || name == "17"){
//         //     let _iemtUI = this.iemtUI.GetComponent<Image>();
//         //     _iemtUI.sprite = image;
//         //     if(this.iemtUI.activeSelf == false)
//         //     {
//         //         this.iemtUI.SetActive(true);
//         //     }
//         //     let _itemCloseBtn = this.itemColseBtn.gameObject.GetComponent<Image>();
//         //     _itemCloseBtn.sprite = this.sprites.get(name+"_");
            
//         //     GameManager.Room().Send("QuestUpdate", parseInt(image.name));
//         // }
//         // else{
//         //     let _questUi = this.questUI.GetComponent<Image>();
//         //     this.room.Send("questUi", image);
//         //     console.log(image);
//         //     _questUi.sprite = image;
            
//         //     // if(this.questUI.activeSelf == false){
//         //     //     this.room.Send("Questui", this.questUI.gameObject.activeSelf);
//         //     //     this.questUI.SetActive(true);
//         //     //     this.room.Send("Questui", this.questUI.gameObject.activeSelf);
//         //     // }
//         //     this.questUI.SetActive(true);
//         //     this.room.Send("Questui", this.questUI.gameObject.activeSelf);
                
//         //     GameManager.Room().Send("QuestUpdate", parseInt(image.name));
//         // }
//         if(this.boolObj == null || this.boolObj == undefined){
//             this.boolObj = this.popup.get(name);
//         }
//         else{
//             this.boolObj.SetActive(false);
//             this.boolObj = this.popup.get(name);
//         }
//         this.boolObj.SetActive(true);
//         if(level != null && name != "x"){
//             GameManager.Room().Send("QuestUpdate", parseInt(name));
//         }
        
        
//     }

//     public ClosePopui(tr:Transform){
//         tr.transform.parent.gameObject.SetActive(false);
//     }

//     public GetItem(name:string){

//         if(name == "glasses"){
//             this.glassesOffBtn.gameObject.SetActive(true);
//         }
//         else if(name == "balloon"){
//             this.balloonOffBtn.gameObject.SetActive(true);
//         }
//         else{
//             this.wingOffBtn.gameObject.SetActive(true);
//         }
//     }

//     Glasses(){
//         if(GameManager.player.quest >= 6){  
//             let glasses = GameManager.GetGlasses();
            
//             if(glasses == null || glasses.gameObject.activeSelf == false)
//             {
//                 this.gameManager.WearGlasses();
//                 this.glassesBtn.gameObject.SetActive(false);
//                 this.glassesOffBtn.gameObject.SetActive(true);
//             }  
//             else{
//                 this.gameManager.TurnOffObj("glasses");
//                 this.glassesBtn.gameObject.SetActive(true);
//                 this.glassesOffBtn.gameObject.SetActive(false);
//             }
//         }
//        else{
//             //GameManager.UI().ShowUI("x", 1);
//             this.ShowUI("x", 1);
//        }
//     }

//     Balloon(){
//         if(GameManager.player.quest >= 12){
//             let balloon = GameManager.GetBalloon();
            
//             if(balloon.activeSelf == false)
//             {
//                 this.gameManager.WearBalloon();
//                 this.balloonBtn.gameObject.SetActive(false);
//                 this.balloonOffBtn.gameObject.SetActive(true);
//             }
//             else{
//                 this.gameManager.TurnOffObj("balloon");
//                 this.balloonBtn.gameObject.SetActive(true);
//                 this.balloonOffBtn.gameObject.SetActive(false);
//             }
//        }
//        else{
//             //GameManager.UI().ShowUI("x", 1);
//             this.ShowUI("x",1);
//         }
//     }

//     Wing(){
//         if(GameManager.player.quest >= 18){
//             let wing = GameManager.GetWing();
            
//             if(wing.activeSelf == false)
//             {
//                 this.gameManager.WearWing();
//                 this.wingBtn.gameObject.SetActive(false);
//                 this.wingOffBtn.gameObject.SetActive(true);
//             }
//             else{
//                 this.gameManager.TurnOffObj("wing");
//                 this.wingBtn.gameObject.SetActive(true);
//                 this.wingOffBtn.gameObject.SetActive(false);
//             }
//     }
//     else{
//             //GameManager.UI().ShowUI("x", 1);
//             this.ShowUI("x",1);
//     }
//     }

//     *Delay(num:string){
//         yield new WaitForSeconds(1);
//         console.log("startcour");
//         this.ShowUI(num, 1);
//     }


// }