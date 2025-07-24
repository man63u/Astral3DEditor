package main

import (
	_ "es-3d-editor-go-back/routers"
	"es-3d-editor-go-back/utils"

	"path/filepath"

	"github.com/beego/beego/v2/adapter/logs"
	"github.com/beego/beego/v2/client/orm"
	beego "github.com/beego/beego/v2/server/web"
	_ "github.com/go-sql-driver/mysql"
)

func init() {
	orm.Debug = true

	if err1 := orm.RegisterDriver("mysql", orm.DRMySQL); err1 != nil {
		logs.Error(err1.Error())
	}

	var sqlConn, _ = beego.AppConfig.String("sql::conn")
	if err2 := orm.RegisterDataBase("default", "mysql", sqlConn); err2 != nil {
		logs.Error(err2.Error())
		panic(err2.Error())
	}

	// 注册各模块
	utils.InitLogger() //调用logger初始化
}

func main() {
	dist := "C:/Users/67097/Desktop/新建文件夹/Rocksi-master/dist/build" // 改成你的绝对路径

	// 主目录
	beego.BConfig.WebConfig.StaticDir["/rocksi"] = dist
	// 额外把代码里用到的绝对路径也映射一下
	beego.BConfig.WebConfig.StaticDir["/models"] = filepath.Join(dist, "models")
	beego.BConfig.WebConfig.StaticDir["/i18n"] = filepath.Join(dist, "i18n")
	beego.BConfig.WebConfig.StaticDir["/images"] = filepath.Join(dist, "images")

	// 老接口也可以：beego.SetStaticPath("/rocksi", rocksiAbsPath)
	// ====== 以上新增 ======
	if beego.BConfig.RunMode == "dev" {
		beego.BConfig.WebConfig.DirectoryIndex = true
		beego.BConfig.WebConfig.StaticDir["/swagger"] = "swagger"
	}
	//var appPath, _ = beego.AppConfig.String("currentAbPath")
	//fmt.Println("当前项目路径:", appPath)
	beego.Run()
}
