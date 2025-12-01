

export default function Home() {



  return (
    <div className="flex min-h-screen flex-col font-sans  ">
        <div className="text-center justify-center items-center px-240px flex bg-black  b-rd-2px h-80px w-100% ">
            <img
                className="w-260px h-26px cursor-pointer"
                src="/logo.webp"
                alt="multimarket logo"
            />

            <input className="max-w-720px b-b-none b-solid ml-50px b-rd-10px min-w-420px pl-15px h-48px c-#909090 b-b-solid b-b-1px b-#383838 placeholder:c-#909090 " defaultValue="搜索multimarket" />

            <div className="flex flex-row items-center gap-8px ">
                <div className="ml-8px">
                    <span className="c-#909090 text-size-14px font-400 ">投资组合:</span>
                    <span className="c-#25A750 text-size-16px font-600">$4.17</span>
                </div>
                <div>
                    <span className="c-#909090 text-size-14px font-400 ">投资组合:</span>
                    <span className="c-#25A750 text-size-16px font-600">$4.17</span>
                </div>

                <div className="flex flex-row items-center gap-8px ">
                    <div className=" w-80px h-40px bg-white flex cursor-pointer items-center justify-center text-size-14px font-500 c-#000000 b-rd-8px">存入</div>
                    <div className="w-80px h-40px flex items-center justify-center">
                        <img
                            className="w-40px h-40px b-rd-50% cursor-pointer"
                            src="/person.png"
                            alt="person center"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="px-240px flex-1">
            <div className="flex c-white h-77px w-100% overflow flex-wrap items-center flex-row b-b-#ffffff">


                <div className="gap-25px flex flex-row items-center">
                    <div className="c-#000 text-size-16px font-600 cursor-pointer">趋势</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">突破</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">新闻</div>
                </div>

                <div className="h-28px b-l-#E6E6E6 b-l-1px b-l-solid ml-25px items-center"></div>
                <div className="gap-25px flex flex-row  ml-50px">
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">政治</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">体育</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">金融</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">加密货币</div>
                </div>
            </div>

            <div className="flex c-white h-70px w-100% overflow flex-wrap items-center flex-row ">


                <div className="gap-25px flex flex-row ">

                    <input className="bg-#F3F3F3 b-rd-3px w-178px h-40px c-#909090 px-15px "  defaultValue="搜索multimarket" />
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer"></div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer"></div>
                </div>

                <div className="h-28px b-l-#E6E6E6 b-l-1px b-l-solid ml-25px"></div>
                <div className="gap-25px flex flex-row    ml-50px items-center">
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer w-56px h-32px bg-#000000 flex items-center justify-center b-rd-4px c-#ffffff font-500 text-size-12px ">全部</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">王牌</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">乌克兰</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">爱博斯坦</div>

                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">特浪普</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">美联储</div>
                    <div className="c-#909090 text-size-14px font-600 cursor-pointer">代比销售</div>
                </div>
            </div>

            <div className="flex flex-wrap">
                <div className="w-340px h-180px bg-#ffffff b-rd-12px b-solid b-#f4f4f4 b-1px px-10px  py-14px">
                    <div className="flex flex-row  ">
                        <img
                            className="w-40px h-40px b-rd-50% cursor-pointer"
                            src="/person.png"
                            alt="person center"
                        />
                        <div className="font-600 text-size-14px c-#000 flex-1">埃隆·马斯克在2025年11月18日至25日期间会发布哪些推文？</div>
                        <div className="h-70px w-54px "></div>
                    </div>
                    <div className="flex flex-row items-center  justify-between">
                        <span className="bg-#25a750/20 flex items-center justify-center w-140px h-40px cursor-pointer b-rd-4px  c-#25A750 font-600 text-size-16px">Yes</span>
                        <span className="bg-#CA4064/20 flex items-center justify-center w-140px h-40px cursor-pointer b-rd-4px opacity-20 c-#CA4064 font-600 text-size-16px">No</span>
                    </div>
                    <div className="flex justify-between mt-5px ">
                        <span className="text-size-12px font-400 c-#909090 ">1.51亿美元销量</span>
                        <img className="w-12px h-14px" />
                    </div>
                </div>

                <div className="w-340px h-180px bg-#ffffff b-rd-12px b-solid b-#f4f4f4 b-1px px-10px  py-14px">
                    <div className="flex flex-row items-center ">
                        <img
                            className="w-40px h-40px b-rd-50% cursor-pointer"
                            src="/person.png"
                            alt="person center"
                        />
                        <div className="font-600 text-size-14px c-#000 flex-1">美联储12月会做出决定吗？</div>
                        <div className="h-70px w-54px "></div>
                    </div>
                    <div className="flex flex-row   ">
                        <div className="flex  flex-row items-center">
                            <span className="text-size-13px c-#000000">下降50个基点以上</span>
                            <span className="text-size-13px c-#000000 ml-auto mr-5px">2%</span>
                            <span className="bg-#25a750/20 flex items-center justify-center w-64px h-32px cursor-pointer b-rd-4px  c-#25A750 font-600 text-size-16px">Yes</span>
                        </div>
                        <div className="flex  flex-row items-center">
                            <span className="text-size-13px c-#000000">增长超过25基点</span>

                            <span className="text-size-13px c-#000000 ml-auto mr-5px">32%</span>
                            <span className="bg-#CA4064/20 flex items-center justify-center w-64px h-32px cursor-pointer b-rd-4px opacity-20 c-#CA4064 font-600 text-size-16px">No</span>

                        </div>
                    </div>
                    <div className="flex justify-between mt-5px ">
                        <span className="text-size-12px font-400 c-#909090 ">1.51亿美元销量</span>
                        <img className="w-12px h-14px" />
                    </div>
                </div>

            </div>
        </div>

        <div className="h-81px w-100% flex items-center px-240px justify-between ">

            <div className="text-size-16px font-500 c-#777e98 ">
                Adventure One QSS Inc. © 2025 • Privacy • Terms of Use • Learn • Careers • Press
            </div>
            <div className="gap-30px flex flex-row">
                <img src="/Facebook.png" alt="" className="w-32px h-31px "/>
                <img src="/ins.png" alt="" className="w-32px h-31px "/>
                <img src="/领英.png" alt="" className="w-32px h-31px "/>
                <img src="/抖音.png" alt="" className="w-32px h-31px "/>
                <img src="/推特.png" alt="" className="w-32px h-31px "/>
                <img src="/YouTube.png" alt="" className="w-32px h-31px "/>
            </div>
        </div>
    </div>
  );
}
