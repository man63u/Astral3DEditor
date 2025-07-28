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

	utils.InitLogger()
}

func main() {
	// 使用相对路径，让别人也能运行
	dist := filepath.Join("static", "rocksi")

	beego.BConfig.WebConfig.StaticDir["/rocksi"] = dist
	beego.BConfig.WebConfig.StaticDir["/models"] = filepath.Join(dist, "assets", "models")
	beego.BConfig.WebConfig.StaticDir["/i18n"] = filepath.Join(dist, "i18n")
	beego.BConfig.WebConfig.StaticDir["/images"] = filepath.Join(dist, "assets", "images")

	if beego.BConfig.RunMode == "dev" {
		beego.BConfig.WebConfig.DirectoryIndex = true
		beego.BConfig.WebConfig.StaticDir["/swagger"] = "swagger"
	}

	beego.Run()
}
