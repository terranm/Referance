Shader "Custom/rainbow_shadow"
{
    Properties
    {
        [Header(Standard)]
        _MainTex("Texture", 2D) = "white"{}

        [Header(Glow)]
        _Glow("Glow", Range(0,1)) = 0.5
        _GlowColor("Glow Color", Color) = (1,1,1,1)

        [Header(UV Scroll)]
        _UVScrollDirection("UV Scroll Direction", Vector) = (1,1,0,0)
        _UVScrollSpeed("UV Scroll Speed", Float) = 1
    }
        SubShader
        {
            LOD 100

            Pass
            {
                Tags { "RenderType" = "Opaque" "LightMode" = "ForwardBase" }

                CGPROGRAM
                #pragma vertex vert
                #pragma fragment frag
                #pragma multi_compile_fwdbase
                #pragma multi_compile __ LIGHTMAP_ON

                #include "UnityStandardBRDF.cginc"
                #include "UnityStandardUtils.cginc"
                #include "AutoLight.cginc"

                sampler2D _MainTex;
                float4 _MainTex_ST;
                float _Glow;
                fixed4 _GlowColor;
                fixed2 _UVScrollDirection;
                float _UVScrollSpeed;

                struct appdata
                {
                    float4 vertex : POSITION;
                    float3 normal : NORMAL;
                    float2 uv : TEXCOORD0;
                    #if defined(LIGHTMAP_ON)
                        float2 uvLightmap : TEXCOORD1;
                    #endif
                };
                struct v2f
                {
                    float4 pos : SV_POSITION;
                    float3 normal : TEXCOORD0;
                    float3 worldPos : TEXCOORD1;
                    SHADOW_COORDS(2)
                    float2 uv : TEXCOORD3;
                    #if defined(LIGHTMAP_ON)
                        float2 uvLightmap : TEXCOORD4;
                    #endif
                };
                v2f vert(appdata v)
                {
                    v2f o;
                    o.pos = UnityObjectToClipPos(v.vertex);
                    o.normal = UnityObjectToWorldNormal(v.normal);
                    o.worldPos = mul(unity_ObjectToWorld, v.vertex);
                    o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                    #if defined(LIGHTMAP_ON)
                        o.uvLightmap = v.uvLightmap * unity_LightmapST.xy + unity_LightmapST.zw;
                    #endif
                    TRANSFER_SHADOW(o);
                    return o;
                }
                fixed4 frag(v2f i) : SV_Target
                {
                    // Light Direction
                    float3 lightDir = _WorldSpaceLightPos0.xyz;

                    // Shadow
                    // half shadow = SHADOW_ATTENUATION(i);

                    // UV Scroll
                    i.uv.xy += _UVScrollDirection * _Time.y * _UVScrollSpeed;

                    // Main Tex
                    fixed3 mainTex = tex2D(_MainTex, i.uv).rgb;

                    // Albedo
                    float3 albedo = mainTex;

                    // Diffuse Lightmap On
                    float3 diffuse = (1,1,1);
                    #if defined(LIGHTMAP_ON)
                        #if defined(DIRLIGHTMAP_COMBINED)
                            fixed3 lightmap = DecodeLightmap(UNITY_SAMPLE_TEX2D(unity_Lightmap, i.uvLightmap));
                            float4 lightmapDirection = UNITY_SAMPLE_TEX2D_SAMPLER(unity_LightmapInd, unity_Lightmap, i.uvLightmap);
                            diffuse = albedo * DecodeDirectionalLightmap(lightmap, lightmapDirection, i.normal);
                        #else
                            diffuse = albedo * DecodeLightmap(UNITY_SAMPLE_TEX2D(unity_Lightmap, i.uvLightmap));
                        #endif
                    #endif

                            // Diffuse Lightmap Off
                            #if defined(LIGHTMAP_OFF)
                                diffuse = albedo;
                                // diffuse = albedo * shadow;
                            #endif

                            // Glow
                            half3 glowColor = _GlowColor;
                            diffuse = lerp(diffuse, glowColor, _Glow);

                            // Finish
                            return fixed4(diffuse, 1);
                        }
                        ENDCG
                    }
                    Pass
                    {
                        Tags { "LightMode" = "ForwardAdd" }
                        Blend One One
                        CGPROGRAM
                        #pragma vertex vert
                        #pragma fragment frag
                        #pragma multi_compile_fwdadd_fullshadows

                        #include "UnityStandardBRDF.cginc"
                        #include "AutoLight.cginc"

                        struct appdata
                        {
                            float4 vertex : POSITION;
                            float4 normal : NORMAL;
                        };
                        struct v2f
                        {
                            float4 pos : SV_POSITION;
                            float3 normal : TEXCOORD0;
                            float3 worldPos : TEXCOORD1;
                            LIGHTING_COORDS(2,3)
                        };
                        v2f vert(appdata v)
                        {
                            v2f o;
                            o.pos = UnityObjectToClipPos(v.vertex);
                            o.normal = UnityObjectToWorldNormal(v.normal);
                            o.worldPos = mul(unity_ObjectToWorld, v.vertex);
                            TRANSFER_SHADOW(o);
                            return o;
                        }
                        fixed4 frag(v2f i) : SV_Target
                        {
                            // Light Position By Object
                            #if defined(POINT) || defined(SPOT)
                                float3 lightDir = normalize(_WorldSpaceLightPos0.xyz - i.worldPos);
                            #else
                                float3 lightDir = _WorldSpaceLightPos0.xyz;
                            #endif

                                // Attenuation (almost shadow)
                                UNITY_LIGHT_ATTENUATION(attenuation, i, i.worldPos);

                                // Light Color
                                fixed3 lightColor = _LightColor0.rgb;

                                // Light Space
                                fixed lightSpace = DotClamped(i.normal, lightDir);

                                // Finish
                                float3 result = lightSpace * attenuation * lightColor;
                                return float4(result, 1);
                            }
                            ENDCG
                        }
                        Pass
                        {
                            Tags { "LightMode" = "ShadowCaster" }
                            CGPROGRAM
                            #pragma vertex vert
                            #pragma fragment frag
                            #pragma multi_compile_shadowcaster
                            #include "UnityCG.cginc"
                            struct v2f { V2F_SHADOW_CASTER; };
                            v2f vert(appdata_base v) { v2f o; TRANSFER_SHADOW_CASTER_NORMALOFFSET(o) return o; }
                            float4 frag(v2f i) : SV_Target {SHADOW_CASTER_FRAGMENT(i)}
                            ENDCG
                        }
        }
            FallBack "Mobile/Unlit (Supports Lightmap)"
}
