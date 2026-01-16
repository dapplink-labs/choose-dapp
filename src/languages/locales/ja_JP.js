import enUS from './en_US'

// 基于英文版结构的日语文件：
// - 先复用 en_US 全量 key，保证不缺字段
// - 再按需覆盖已经有日语翻译的部分
const base = enUS

export default {
  ...base,
  assetManagement: {
    totalAssets: "総資産評価額",
    deposit: "入金",
    withdraw: "出金",
    bill: "明細",
    funds: "資金",
    earnings: "収益",
    fo: "FO",
    assetDistribution: "資産分布",
    overview: "資産概要",
    prediction: "予測",
    predictionPlaceholder: "予測機能は近日公開予定",
    name: "名称",
    quantity: "数量",
    value: "価値",
    profitLoss: "損益",
    rewards: "報酬",
    winnings: "当選",
    amountWon: "獲得金額",
    action: "操作",
    claim: "請求",
    searchPlaceholder: "銘柄や市場、コードを検索",
    // 時間周期
    timePeriod1d: "1日",
    timePeriod1w: "1週間",
    timePeriod1m: "1ヶ月",
    timePeriodAll: "すべて",
    // ポジションリスト
    positionEvents: "ポジションイベント",
    entrustedPositions: "委託ポジション",
    historyPositionEvents: "履歴ポジションイベント",
    all: "すべて",
    buy: "Buy",
    sell: "Sell",
    // ステータス
    lost: "lost",
    claimed: "claimed",
    // その他
    valueLabel: "価値",
    search: "Search"
  },
  link: {
    titel: "ウォレット接続",
    exit: "接続解除",
    connectFailed: "ウォレット接続に失敗しました。もう一度お試しください",
    signatureRequired: "ウォレット接続には署名認証が必要です。再接続して署名を完了してください"
  },
  linkWallet: {
    welcome: "CHOOSEMEへようこそ",
    selectLoginMethod: "ウォレットを選択してください",
    connect: "接続"
  },
  bindEmail: {
    title: "メールアドレス連携",
    placeholder: "メールアドレス",
    sendCode: "認証コード送信"
  },
  invite: {
    title: "CHOOSEMEへようこそ",
    placeholder: "招待コード",
    tip: "招待コードを入力すると、より多くの収益報酬を獲得するチャンスがあります",
    codeRequired: "招待コードは必須です",
    bindSuccess: "招待コードの連携に成功しました",
    bindFail: "招待コードの連携に失敗しました",
    contractBindSuccess: "オンチェーンでの招待コード連携に成功しました",
    contractBindFailed: "オンチェーンでの招待コード連携に失敗しました",
    contractBindCancelled: "オンチェーン連携をキャンセルしました",
    invalidAddress: "無効な招待アドレス形式です",
    missingContract: "NodeManager コントラクトアドレスが設定されていません",
    bindInvitationTitle: "招待関係の連携",
    bindInvitationDesc: "招待関係を連携すると、あなたのアカウントが招待者と関連付けられ、ステーキングと予測に関連する報酬の計算と配布に使用されます。",
    myInvitationAddress: "私の招待アドレス",
    shareNow: "今すぐ共有",
    invitationCodeCopied: "招待コードをクリップボードにコピーしました",
    noInvitationCode: "招待コードなし"
  },
  navbar2: {
    nav: {
      trends: "トレンド",
      breaking: "ホットトピック",
      news: "最新",
      esports: "eスポーツ",
      sports: "スポーツ",
      finance: "経済",
      crypto: "暗号通貨",
      company: "企業",
      popularCulture: "ポップカルチャー",
      technology: "テクノロジー",
      ai: "人工知能"
    }
  },
  home: {
    ...base.home,
    comingSoon: "予測市場 オープン間近",
    searchPlaceholder: "検索"
  },
  footerNav: {
    home: "ホーム",
    breaking: "速報"
  },
  computingPower: {
    title: "ノード購入",
    desc: "ノードを購入し、データノード収益、取引手数料収益、サブトークン手数料収益、二次市場収益を享受し、より多くのノード参加を促進してさらなる収益を獲得しましょう。詳細を見る",
    learnMore: "詳細を見る",
    buyNode: "ノードをアクティベート",
    myNodes: "マイノード",
    tabs: {
      distributed: "分散ノード",
      cluster: "クラスターノード"
    },
    priceLabel: "価格：",
    buyBtn: "購入",
    record: {
      ...base.computingPower.record
    },
    benefits: {
      item1: "データノード収益を享受",
      item2: "全ネットワーク取引手数料売買 0.5% 収益",
      item3: "サブトークン手数料 3%",
      item4: "二次市場利益 10% 収益",
      item5: "分散型ハッシュパワーノードが分散型ハッシュパワーノードを推進"
    },
    purchaseTitle: {
      ...base.computingPower.purchaseTitle
    },
    activationMsg: "アドレス {address} が[{nodeType}]を正常にアクティベートしました",
    activateBtn: "ノードをアクティベート",
    activating: "アクティベート中",
    purchased: "購入済み",
    connectWalletFirst: "まずウォレットを接続してください",
    activatingNode: "ノードをアクティベート中...",
    insufficientBalance: "残高不足！",
    requestingAuth: "USDT 承認をリクエスト中...",
    payingAndActivating: "支払いとノードアクティベート中...",
    fetchNodeDataFailed: "ノードサービスプロバイダーデータの取得に失敗しました",
    nodeActivationSuccess: "ノードアクティベート成功！",
    paymentFailed: "支払い失敗",
    paymentCancelled: "支払いをキャンセルしました",
    products: {
      distributedDescTemplate: "データノード収益を享受、全ネットワーク取引手数料売買 {fee}% 収益、サブトークン手数料 {subFee}%。二次市場分潤 {marketShare}% 収益、分散型ハッシュパワーノードが分散型ハッシュパワーノードを推進。",
      clusterDescTemplate: "データノード収益を享受、全ネットワーク取引手数料 {fee}% 分潤、サブトークン手数料 {subFee}% 分潤、二次市場業績 {marketShare}% 分潤、エコシステムレベルのノードプロモーションとガバナンス参加を享受。"
    }
  },
  lpVault: {
    title: "ステーキングプール",
    desc: "世界初のオンチェーン循環参入、循環LP プール構築、循環バーン、循環エグジット、循環アプリケーションによる永久機関システム。各投資ティアは、LP構築→ プールバーンの循環モデルに従い、コントラクトが自動実行します。詳細を見る",
    learnMore: "詳細を見る",
    nodeStaking: "ノードをアクティベート",
    myLPIncome: "マイ収益",
    activationPrice: "アクティベーション価格:",
    dailyEarnings: "日次换算収益",
    cycleDays: "サイクル日数",
    totalEarnings: "総収益",
    activateComputingPower: "ノードをアクティベート",
    activationMsg: "アドレス {address} が {nodeType} をアクティベートしました",
    nodeTypes: {
      T1: "インフォメーションノード",
      T2: "データノード",
      T3: "バリデーションノード",
      T4: "コンセンサスノード",
      T5: "スーパーノード",
      T6: "ジェネシスノード"
    },
    days: "日",
    nodeTypeNotFound: "対応するノードタイプが見つかりません",
    invalidPrice: "ノード価格が無効です",
    connectWalletFirst: "まずウォレットを接続してください",
    activatingNode: "ノードをアクティベート中...",
    insufficientBalance: "残高不足",
    requestingAuth: "USDT 承認をリクエスト中...",
    approvalSuccess: "承認成功",
    userCancelledAuth: "承認をキャンセルしました",
    approveTokenFailed: "承認失敗",
    nodeActivationSuccess: "ノードアクティベート成功！",
    paymentFailed: "支払い失敗",
    paymentCancelled: "支払いをキャンセルしました"
  },
  myNode: {
    title: "クラスターノード",
    choIncome: "CHO収益",
    subCoinIncome: "サブコイン収益",
    earnPrompt: "アドレス {address} が{amount} CHOの収益を獲得",
    earnPromptShort: "収益を獲得",
    pendingIncome: "発行済み報酬",
    nodeIncome: "ノード収益",
    networkFeeIncome: "全ネットワーク手数料売買収益",
    subCoinFeeIncome: "サブコイン手数料収益",
    secondaryMarketIncome: "セカンダリーマーケット利益収益",
    directReferralIncome: "直接紹介収益",
    networkIncome: "チーム収益",
    claimAll: "全収益の受取",
    claim: "受取",
    claimSuccess: "受取成功",
    claimFailed: "受取失敗",
    claimCancelled: "受取をキャンセルしました",
    connectWalletFirst: "まずウォレットを接続してください",
    missingContractAddress: "NodeManager コントラクトアドレスが不足しています",
    myTeam: "マイチーム",
    inviteAddressCount: "招待アドレス数",
    directAddressCount: "直接紹介アドレス数",
    teamTotalAddressCount: "チーム総アドレス数",
    directAddress: "直接紹介",
    teamAddress: "チーム",
    activated: "がアクティベート",
    nodeTypes: {
      distributed: "分散ノード",
      cluster: "クラスターノード"
    }
  },
  myIncome: {
    ...base.myIncome,
    pendingIncome: "発行済み報酬",
    noStakingNode: "通知",
    noStakingNodeMessage: "ステーキングノードがまだありません。収益を表示する前に、まずノードをステーキングしてください",
    nodeNames: {
      ...(base.myIncome?.nodeNames || {}),
      genesisNode: "ジェネシスノード"
    }
  },
  dashboard: {
    title: "ダッシュボード",
    tabs: {
      currentPrice: "CHO現価",
      pledge: "LPトレジャリー",
      computingPool: "ハッシュパワープール",
      marketReturns: "市場収益"
    }
  },
  cmtCurrentPrice: {
    latestPrice: "最新価格",
    high24h: "24H最高",
    low24h: "24H最安",
    volume24hCMT: "24H出来高CHO",
    volume24hUSDT: "24H出来高USDT",
    timePeriods: {
      "5m": "5分",
      "1h": "1時間",
      "4h": "4時間",
      "1d": "1日"
    },
    tooltip: {
      open: "始値",
      close: "終値",
      low: "最安",
      high: "最高",
      volume: "出来高"
    }
  },
  cmtPledge: {
    pledgeTotal: "ステーキング総額(USDT)",
    lpPledgeDestroy: "LPステーキングバーン (USDT)",
    timePeriods: {
      "7d": "7日",
      "30d": "30日",
      "90d": "90日",
      "1y": "1年",
      "all": "全体"
    }
  },
  computingPool: {
    pledgeTotal: "ステーキング総額",
    composition: "ハッシュパワープール構成",
    distributedNodeTotal: "分散ノード総額",
    clusterNodeTotal: "クラスターノード総額",
    timePeriods: {
      "7d": "7日",
      "30d": "30日",
      "90d": "90日",
      "1y": "1年",
      "all": "全体"
    }
  },
  marketReturns: {
    secondaryMarketProfit: "二次市場収益",
    userProfit: "ユーザー利益金額",
    destroyedCMT: "バーンされたCMT数量",
    myProfit: "マイ利益金額",
    profit24hCHO: "24時間利益(CHO)",
    profit24hUSDT: "24時間利益(USDT)",
    fomoProfit: "FOMO利益金額",
    fomoVolume24hCMT: "24時間FOMO量(CMT)",
    fomoVolume24hUSDT: "24時間FOMO量(USDT)",
    latestMarketValue: "予測市場時価総額",
    volume24hCMT: "24時間量(CMT)",
    volume24hUSDT: "24時間量(USDT)"
  },
  userInfo: {
    disconnect: "ウォレット切断",
    ecosystem: "エコシステム",
    others: "その他",
    chooseMe: "ChooseMe",
    stakingPool: "ノード購入",
    lpVault: "ステーキングプール",
    onChainData: "オンチェーンデータ",
    predictionMarket: "予測市場を作成",
    assets: "オンチェーン資産",
    eventPool: "イベントプール",
    audit: "監査",
    developerDocs: "更新ログ",
    alpha: "Alpha テスト",
    developerContributions: "開発者貢献",
    tokenomics: "トークンエコノミクスモデル",
    launchpad: "タスクプラットフォーム",
    smartMoney: "スマートマネー",
    bugBounty: "バグ報奨金",
    github: "GitHub",
    technicalSupport: "技術サポート",
    language: "言語切り替え",
    support: "技術サポート",
    officialVerification: "公式検証",
    productFeedback: "製品フィードバック",
    apiManagement: "API管理",
    helpCenter: "ヘルプセンター",
    customerSupport: "オンラインサポート",
    selfService: "セルフサービス",
    disconnectWallet: "ウォレット切断",
    dashboard: "ダッシュボード",
    createMarket: "予測市場作成",
    fundManagement: "資金管理",
    reward: "リワード",
    accuracy: "精度",
    leaderboard: "ランキング",
    terms: "利用規約",
    doc: "ドキュメント",
    walletAddressCopied: "ウォレットアドレスをクリップボードにコピーしました",
    copyFailed: "コピーに失敗しました。手動でコピーしてください",
    linkCopied: "リンクをクリップボードにコピーしました",
    borrow: "借入",
    earn: "稼ぐ",
    strategyTrading: "戦略取引",
    copyTrading: "コピートレード",
    airdrop: "エアドロップ",
    academy: "アカデミー",
    nft: "NFT",
    rwa: "RWA"
  },
  settings: {
    title: "プロフィール",
    email: "メール",
    emailPlaceholder: "メールアドレスを入力してください",
    emailHelper: "ChooseMeの重要な更新情報を受け取るために使用されます",
    username: "ユーザー名",
    usernamePlaceholder: "ユーザー名を入力してください",
    twitter: "Twitter",
    bindTwitter: "連携",
    saveText: "保存"
  },
  purchaseNodeRecord: {
    title: "ノードステーキング記録",
    nodeType: "ノードタイプ",
    nodePrice: "ノード価格",
    purchaseTime: "購入時間",
    empty: "記録はありません",
    informationNode: "情報ノード"
  },
  claimRecord: {
    title: "受取記録",
    computingPowerService: "ハッシュパワーサービス",
    lpVault: "ステーキングプール",
    distributedNode: "分散ノード",
    clusterNode: "クラスターノード"
  },
  common: {
    ...base.common,
    search: "検索",
    more: "もっと見る",
    skip: "スキップ",
    continue: "続ける",
    confirm: "確定",
    loading: "読み込み中...",
    complete: "完了",
    price: "価格",
    share: "共有",
    noData: "データがありません...",
    address: "アドレス",
    noData: "データがありません..."
  }
}

