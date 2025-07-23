// Package routers
// @APIVersion 1.0.0
// @Title ES3DEditor API
// @Description ES3DEditor API
// @Contact  mlt131220@163.com
// @TermsOfServiceUrl https://mhbdng.cn/
// @License Apache 2.0
// @LicenseUrl http://www.apache.org/licenses/LICENSE-2.0.html
package routers

import (
	"es-3d-editor-go-back/controllers/editor3d/bim"
	"es-3d-editor-go-back/controllers/editor3d/cad"
	"es-3d-editor-go-back/controllers/editor3d/scenes"
	"es-3d-editor-go-back/controllers/system"
	"es-3d-editor-go-back/server"
	"es-3d-editor-go-back/utils/jwt"

	beego "github.com/beego/beego/v2/server/web"
	"github.com/beego/beego/v2/server/web/context"

	// 空白导入即可：Beego 会在 init() 里自动注册 /swagger/
	_ "github.com/beego/beego/v2/server/web/swagger"
)

func init() {
	// ① 业务接口路由
	ns := beego.NewNamespace("/api",
		// 系统级接口
		beego.NSNamespace("/sys",
			beego.NSInclude(
				&system.LbSysUserController{},
				&system.LbSysUploadController{},
				&system.LbSysWebSocketController{},
				&system.LbSysUpYunController{},
			),
		),
		// 三维编辑器接口
		beego.NSNamespace("/editor3d",
			beego.NSInclude(
				&bim.Lb3dEditorBimToGltfController{},
				&cad.Lb3dEditorCadController{},
				&scenes.Lb3dEditorScenesController{},
				&scenes.Lb3dEditorScenesExampleController{},
			),
		),
	)

	// ② 鉴权过滤（如暂时不用，可整段注释）
	beego.InsertFilter("/api/admin/*", beego.BeforeRouter, func(ctx *context.Context) {
		token := ctx.Request.Header.Get("X-Token")
		if token == "" {
			OutJson(ctx, server.RequestNoPermission())
			return
		}
		if _, err := jwt.ValidateToken(token); err != nil {
			OutJson(ctx, server.RequestNoPermission())
			return
		}
	})

	// ③ 注册业务 namespace
	beego.AddNamespace(ns)

}

// OutJson 统一输出
func OutJson(ctx *context.Context, out server.ResultJson) {
	ctx.Output.Status = 200
	ctx.Output.Header("Access-Control-Allow-Credentials", "true")
	ctx.Output.Header("Access-Control-Allow-Headers", "x-token,X-Token")
	ctx.Output.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
	ctx.Output.Header("Access-Control-Allow-Origin", "*")
	ctx.Output.Header("Access-Control-Expose-Headers", "Content-Length,Access-Control-Allow-Origin,Access-Control-Allow-Headers,Content-Type")
	ctx.Output.JSON(out, true, true)
}
