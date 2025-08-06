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

	// 直接使用硬编码的连接字符串进行测试
	sqlConn := "astral:Astral@2025!@tcp(127.0.0.1:3306)/astral3d_dev?charset=utf8mb4&parseTime=true&loc=Local"
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
