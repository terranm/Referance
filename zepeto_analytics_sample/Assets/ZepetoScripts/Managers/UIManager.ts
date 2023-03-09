import { Canvas, GameObject, WaitForSeconds } from 'UnityEngine';
import { Image } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

enum LoadingType {
    Start = "UI_Loarding_Start",
    Teleport = "UI_Loarding_Teleport",
    NONE = "",
}
export default class UIManager extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: UIManager;
    public static get instance(): UIManager { return UIManager._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public get LOADING_START()     :LoadingType { return LoadingType.Start; }
    public get LOADING_TELEPORT()  :LoadingType { return LoadingType.Teleport; }
    public get LOADING_NONE()      :LoadingType { return LoadingType.NONE; }

    @SerializeField()
    public canvas : GameObject;
    private loadingUIs : GameObject[];

    private openUI:GameObject;

    private isPlaying : boolean;
    private isLoading : boolean;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Awake()
    {
        UIManager._instance = this;

        if(this.canvas == null)
            return;

        const images = this.canvas.GetComponentsInChildren<Image>();
        this.loadingUIs = new Array<GameObject>();
        
        for(const img of images)
        {
            switch(img.tag)
            {
                case "Loading": 
                    this.loadingUIs.push(img.gameObject);
                    img.gameObject.SetActive(false);
                    break;
            }
        }
    }

    Start()
    {    

    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// public
    public StartLoading(type:LoadingType)
    {
        this.StartCoroutine(this.LoadingCoroutine(type));
    }
    public StopLoading(type:LoadingType)
    {
        const loadingImage = this.FindLoadingImage(type);
        this.isLoading = false;
        this.isPlaying = false;
        this.CloseUI(loadingImage);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// public END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading
    private * LoadingCoroutine(type:LoadingType)
    {
        if(this.isPlaying || this.isLoading)
            return;

        const loadingImage = this.FindLoadingImage(type);
        this.openUI = loadingImage;
        if(loadingImage == null)
        {
            console.error(` ----------------- loadingImage == null & type : ${type} `);
            return;
        }

        this.isPlaying = true;
        this.isLoading = true;

        loadingImage.SetActive(true);
        
        while(this.isLoading)
        {
            yield null;
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// UI Close
    private CloseUI(ui:GameObject)
    {
        if(ui == null)
        {
            console.error(` ----------------- ui == null`);
            return;
        }

        ui.SetActive(false);
        this.openUI = null;
        this.StopAllCoroutines();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// UI Close END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Find GameObject
    FindLoadingImage(type:LoadingType) : GameObject
    {
        const typeName :string = type as string;
        for (const item of this.loadingUIs) {
            if(item.name == typeName)
                return item;
        }
        return null;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Find GameObject END

}