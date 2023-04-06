import { Camera, CameraClearFlags, Color, GameObject, Graphics, Material, Rect, RenderTexture, Sprite, Texture2D, WaitForEndOfFrame } from 'UnityEngine';
import { RawImage } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldContent } from 'ZEPETO.World';
import UIController from './UIController';

export default class ScreenShotController extends ZepetoScriptBehaviour {
    
    // Camera used to take screenshots
    private camera: Camera;

    private preClearFlags:CameraClearFlags;
    private preBackgroundColor:Color

    // Use 1920 x 1080 size set in Render Texture
    public renderTexture: RenderTexture;

    // 합성용 텍스쳐 관련 전역변수
    public screenshotBlendModule : GameObject;
    private scrBlendResultTexture : RenderTexture;
    private scrBlendCam : Camera;
    public scrBlendRenderTextures : RenderTexture[];
    // public frame : Sprite;
    
    // Background canvas for transparent background shooting
    public backgroundCanvas: GameObject;
    public uiControllerObject:GameObject;
    private uiController:UIController;
    public feedMessage: string;
    Awake(){
        this.uiController = this.uiControllerObject.GetComponent<UIController>();
        // this.renderTexture2ds = new Array();
        this.scrBlendResultTexture = new RenderTexture(1920,1080,16);
        this.scrBlendCam = this.screenshotBlendModule.GetComponentInChildren<Camera>();
        // this.scrBlendRenderTextures = new Array();
    }

    // Set the camera used to take a screenshot. 
    public SetScreenShotCamera(camera: Camera) {
        this.camera = camera;
    }

    // Onclick Function - Take Screenshot Button
    public TakeScreenShot(isBackgroundOn: boolean) {
        if (isBackgroundOn) {
            this.TakeScreenShotWithBackground();
        } else {
            this.TakeScreenShotWithoutBackground();
        }
    }
    private cnt = 0;
    public TakeDoubleScreenShot(){
        // let rt_temp = new RenderTexture(this.renderTexture.width,this.renderTexture.height, 16);
        Graphics.Blit(this.renderTexture, this.scrBlendRenderTextures[this.cnt]);
        //  = rt_temp;
        // console.log(this.cnt);
        return this.scrBlendRenderTextures[this.cnt++];
        // let t2d = new Texture2D(this.renderTexture.width/this.downsizeRate,this.renderTexture.height/this.downsizeRate);
        // let rt_downsize = new RenderTexture(this.renderTexture.width/this.downsizeRate,this.renderTexture.height/this.downsizeRate, 16);
        // Graphics.Blit(this.renderTexture, rt_downsize);
        // RenderTexture.active = rt_downsize;
        // t2d.ReadPixels(new Rect(0, 0, rt_downsize.width, rt_downsize.height), 0, 0);
        // t2d.Apply();
        // this.renderTexture2ds.push(t2d);

        // return this.renderTexture2ds[this.renderTexture2ds.length-1];
    }
  
    public CombineTexture(){
        // console.log("CombineTexture in");
        // let width = 1920;
        // let height = 1080;
        // console.log("CombineTexture in rendertexture create");
        // let resultTex2d = new Texture2D(width*2, height*2);

        // for (let i = 0; i < this.renderTexture2ds.length; i++)
        // {
        //     let x = (i % 2) * width; // 0 1 0 1
        //     let y = Math.floor((this.renderTexture2ds.length - i - 1) / 2) * height; // 0 0 1 1
    
        //     let pixels = this.renderTexture2ds[i].GetPixels();
        //     resultTex2d.SetPixels(x, y, width, height, pixels);
        // }
        // resultTex2d.Apply();

        // Graphics.Blit(resultTex2d, this.scrBlendTexture);

        this.scrBlendCam.targetTexture = this.renderTexture;
        this.scrBlendCam.Render();
        this.scrBlendCam.targetTexture = null;

        for(let i = 0; i < this.scrBlendRenderTextures.length; i++){
            this.scrBlendRenderTextures[i] = null;
        }


        // RenderTexture.active = this.renderTexture;
        // let resultTex2d2 = new Texture2D(this.frame.textureRect.width,this.frame.textureRect.height);
        // resultTex2d2.ReadPixels(new Rect(0, 0, this.renderTexture.width, this.renderTexture.height), 0, 0);
        // let pxs = this.frame.texture.GetPixels(Math.floor(this.frame.textureRect.x),Math.floor(this.frame.textureRect.y),Math.floor(this.frame.textureRect.width),Math.floor(this.frame.textureRect.height));
        // resultTex2d2.SetPixels(0,0,this.frame.textureRect.width,this.frame.textureRect.height, pxs);
        // resultTex2d2.Apply();
        // Graphics.Blit(resultTex2d2, this.renderTexture);
        // console.log("CombineTexture end");
        // this.renderTexture2ds = new Array();
    }

    // onClick function - Save button on screenshot result screen
    public SaveScreenShot() {
        //Save Screenshot
        ZepetoWorldContent.SaveToCameraRoll(this.renderTexture, (result: boolean) => { console.log(`${result}`) });
    }
    // onClick function - Share button on screenshot result screen
    public ShareScreenShot() {
        ZepetoWorldContent.Share(this.renderTexture, (result: boolean) => { console.log(`${result}`) });
    }

    // onClick function - Create feed button on screenshot result screen
    public CreateFeedScreenShot() {
        ZepetoWorldContent.CreateFeed(this.renderTexture, this.feedMessage, (result: boolean) => {
            this.uiController.ShowCreateFeedResult(result);
        });
    }

    *RenderTargetTextureWithBackground()
    {
        yield new WaitForEndOfFrame();
        this.camera.Render();
        this.camera.targetTexture = null;
    }

    *RenderTargetTextureWithoutBackground()
    {
        yield new WaitForEndOfFrame();
        this.camera.Render();

        // 4. Revert existing settings 
        this.camera.targetTexture = null;
        this.camera.backgroundColor = this.preBackgroundColor;
        this.camera.clearFlags = this.preClearFlags;

        // 5. Reactivate the background canvas while taking a screenshot
        this.backgroundCanvas.gameObject.SetActive(true);
    }

    private TakeScreenShotWithBackground() {
        // Specify the target texture and render the camera
        this.camera.targetTexture = this.renderTexture;
        
        this.camera.Render();
        this.camera.targetTexture = null;
        // this.StartCoroutine(this.RenderTargetTextureWithBackground());

    }

    private TakeScreenShotWithoutBackground() {
        // Disable background canvas while taking screenshots
        this.backgroundCanvas.gameObject.SetActive(false);

        // 1. Specify the target texture and save the camera flag/color values before the screenshot
        this.camera.targetTexture = this.renderTexture;
        this.preClearFlags = this.camera.clearFlags;
        this.preBackgroundColor = this.camera.backgroundColor;

        // 2. Fill the background of the camera with a solid color and make the background color transparent. 
        this.camera.clearFlags = CameraClearFlags.SolidColor;
        this.camera.backgroundColor = new Color(0, 0, 0, 0);

        // 3. Camera Render
        this.StartCoroutine(this.RenderTargetTextureWithoutBackground());

    }
}
