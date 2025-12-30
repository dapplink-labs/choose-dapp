import enUS from './en_US'

// 基于英文版结构的韩语占位文件：
// - 先复用 en_US 全量 key，保证不缺字段
// - 再按需覆盖已经有韩语文案的部分
const base = enUS

export default {
  ...base,
  link: {
    titel: "지갑 연결",
    exit: "연결 해제"
  },
  navbar2: {
    nav: {
      trends: "트렌드",
      breaking: "핫토픽",
      news: "최신",
      esports: "e스포츠",
      sports: "스포츠",
      finance: "경제",
      crypto: "암호화폐",
      company: "기업",
      popularCulture: "대중문화",
      technology: "기술",
      ai: "인공지능"
    }
  },
  home: {
    ...base.home,
    comingSoon: "예측 시장 오픈 임박"
  },
  footerNav: {
    home: "홈",
    breaking: "속보"
  },
  common: {
    ...base.common,
    search: "검색",
    more: "더보기",
    skip: "건너뛰기",
    continue: "계속",
    confirm: "확인",
    price: "가격",
    buy: "구매"
  },
  linkWallet: {
    welcome: "CHOOSEME에 오신 것을 환영합니다",
    selectLoginMethod: "지갑을 선택해 주세요",
    connect: "연결"
  },
  bindEmail: {
    title: "이메일 연동",
    placeholder: "이메일 주소",
    sendCode: "인증번호 발송"
  },
  invite: {
    title: "CHOOSEME에 오신 것을 환영합니다",
    placeholder: "초대 코드",
    tip: "* 초대 코드를 입력하면 더 많은 수익 보상을 받을 기회가 있습니다"
  },
  computingPower: {
    title: "해시파워 서비스 제공자",
    desc: "해시파워 서비스 제공자가 되어 데이터 노드 수익, 거래 수수료 수익, 서브 토큰 수수료 수익, 2차 시장 수익을 누리고, 더 많은 노드 참여를 유도하여 더 많은 수익을 얻으세요.",
    learnMore: "자세히 보기",
    buyNode: "노드 활성화",
    myNodes: "내 노드",
    tabs: {
      distributed: "분산 노드",
      cluster: "클러스터 노드"
    },
    nodeImageAlt: "노드 일러스트",
    priceLabel: "가격：",
    buyBtn: "구매",
    record: {
      title: "노드 활성화 기록",
      timeLabel: "작업 시간",
      typeLabel: "제품 유형",
      amountLabel: "USDT 소비",
      types: {
        distributed: "분산 노드",
        cluster: "클러스터 노드"
      }
    },
    benefits: {
      item1: "데이터 노드 수익 누림",
      item2: "전체 네트워크 거래 수수료 매매 0.5% 수익",
      item3: "서브 토큰 수수료 3%",
      item4: "2차 시장 수익 10% 수익",
      item5: "분산형 해시파워 노드가 분산형 해시파워 노드 추진"
    },
    purchaseTitle: {
      distributed: "분산 노드-500 USDT",
      cluster: "클러스터 노드-10000 USDT"
    },
    activationMsg: "주소 {address} 가 [{nodeType}]를 성공적으로 활성화했습니다",
    activateBtn: "노드 활성화",
    products: {
      distributedDescTemplate: "데이터 노드 수익 누림, 전체 네트워크 거래 수수료 매매 {fee}% 수익, 서브 토큰 수수료 {subFee}%. 2차 시장 분배 {marketShare}% 수익, 분산형 해시파워 노드가 분산형 해시파워 노드 추진.",
      clusterDescTemplate: "데이터 노드 수익 누림, 전체 네트워크 거래 수수료 {fee}% 분배, 서브 토큰 수수료 {subFee}% 분배, 2차 시장 실적 {marketShare}% 분배, 생태계급 노드 홍보 및 거버넌스 참여 누림."
    }
  },
  lpVault: {
    title: "LP 트레저리",
    desc: "세계 최초의 온체인 순환 진입, 순환 LP 풀 구성, 순환 소각, 순환 퇴장, 순환 적용의 영구 기관 시스템. 각 투자 단계는 LP 구성 → 풀 소각의 순환 모드에 따라 계약이 자동 실행됩니다.",
    learnMore: "자세히 보기",
    nodeStaking: "노드 활성화",
    myLPIncome: "내 수익",
    activationPrice: "활성화 가격:",
    dailyEarnings: "일일 환산 수익",
    cycleDays: "주기 일수",
    totalEarnings: "총 수익",
    activateComputingPower: "노드 활성화",
    activationMsg: "주소 {address} 가 [{nodeType}]을(를) 활성화했습니다",
    nodeTypes: {
      T1: "정보 노드",
      T2: "데이터 노드",
      T3: "검증 노드",
      T4: "합의 노드",
      T5: "슈퍼 노드",
      T6: "제네시스 노드"
    },
    days: "일"
  },
  myNodes: {
    title: "내 노드"
  },
  myNode: {
    title: "클러스터 노드",
    choIncome: "CHO 수익",
    subCoinIncome: "하위 코인 수익",
    earnPrompt: "주소 {address} 수익 획득",
    pendingIncome: "수령 대기 수익",
    nodeIncome: "노드 수익",
    networkFeeIncome: "전체 네트워크 수수료 매매 수익",
    subCoinFeeIncome: "하위 코인 수수료 수익",
    secondaryMarketIncome: "2차 시장 이익 수익",
    directReferralIncome: "직접 추천 수익",
    networkIncome: "팀 수익",
    claimAll: "모든 수익 수령",
    claim: "수령",
    myTeam: "나의 팀",
    inviteAddressCount: "초대 주소 수",
    directAddress: "직접 추천 주소",
    teamAddress: "팀 주소",
    activated: "활성화됨",
    nodeTypes: {
      distributed: "분산 노드",
      cluster: "클러스터 노드"
    }
  },
  myIncome: {
    title: "나의 수익",
    myIncomeCMT: "나의 수익(CMT)",
    computingPowerIncomeCMT: "해시 파워(Mining) 수익 (CMT)",
    networkIncomeCMT: "네트워크 수익 (CMT)",
    earnPrompt: "주소 {address} 수익 획득",
    pendingIncome: "수령 대기 수익",
    staticIncomeCHO: "스테이킹(Static) 수익 (CHO)",
    directReferralIncomeCHO: "직접 추천 수익 (CHO)",
    teamIncomeCHO: "팀(Team) 수익 (CHO)",
    genesisNodeIncomeCHO: "제네시스 노드 수익 (CHO)",
    superNodeIncomeCHO: "슈퍼 노드 수익 (CHO)",
    claimAll: "수익 수령",
    myTeam: "팀",
    mySuperior: "직접 추천",
    totalInvites: "초대한 노드 수: %d",
    superNode: "정보 노드",
    purchaseTime: "활성화 시간 %s",
    upline: "직접 추천",
    nodeNames: {
      infoNode: "정보 노드",
      dataNode: "데이터 노드",
      validationNode: "검증 노드",
      consensusNode: "합의 노드"
    },
    earningsOptions: {
      allNodeRewards: "모든 수익 수령",
      dataNode: "데이터 노드",
      validationNode: "검증 노드"
    }
  },
  dashboard: {
    title: "대시보드",
    tabs: {
      currentPrice: "CHO 현가",
      pledge: "LP 트레저리",
      computingPool: "해시파워 풀",
      marketReturns: "시장 수익"
    }
  },
  cmtCurrentPrice: {
    latestPrice: "최신 가격",
    high24h: "24H 최고",
    low24h: "24H 최저",
    volume24hCMT: "24H 거래량 CHO",
    volume24hUSDT: "24H 거래량 USDT",
    timePeriods: {
      "5m": "5분",
      "1h": "1시간",
      "4h": "4시간",
      "1d": "1일"
    },
    tooltip: {
      open: "시가",
      close: "종가",
      low: "최저가",
      high: "최고가",
      volume: "거래량"
    }
  },
  cmtPledge: {
    pledgeTotal: "스테이킹 총액",
    lpPledgeDestroy: "LP 스테이킹 소각(USDT)",
    timePeriods: {
      "7d": "7일",
      "30d": "30일",
      "90d": "90일",
      "1y": "1년",
      "all": "전체"
    }
  },
  computingPool: {
    pledgeTotal: "스테이킹 총액(USDT)",
    composition: "해시파워 풀 구성",
    distributedNodeTotal: "분산 노드 총액",
    clusterNodeTotal: "클러스터 노드 총액",
    timePeriods: {
      "7d": "7일",
      "30d": "30일",
      "90d": "90일",
      "1y": "1년",
      "all": "전체"
    }
  },
  marketReturns: {
    secondaryMarketProfit: "2차 시장 수익",
    userProfit: "유저 수익",
    destroyedCMT: "소각된 CMT 수량",
    myProfit: "나의 수익 금액",
    profit24hCHO: "24H 수익(CHO)",
    profit24hUSDT: "24H 수익(USDT)",
    fomoProfit: "FOMO 수익 금액",
    fomoVolume24hCMT: "24H FOMO 거래량(CMT)",
    fomoVolume24hUSDT: "24H FOMO 거래량(USDT)",
    latestMarketValue: "예측 시장 시가총액",
    volume24hCMT: "24H 거래량(CMT)",
    volume24hUSDT: "24H 거래량(USDT)"
  },
  userInfo: {
    disconnect: "지갑 연결 해제",
    ecosystem: "생태계",
    others: "기타",
    chooseMe: "ChooseMe",
    stakingPool: "해시파워 풀",
    lpVault: "LP 트레저리",
    onChainData: "온체인 데이터",
    predictionMarket: "예측 시장",
    assets: "자산",
    eventPool: "이벤트 풀",
    audit: "감사",
    developerDocs: "개발자 문서",
    alpha: "Alpha 테스트",
    developerContributions: "개발자 기여",
    tokenomics: "토큰 이코노미",
    launchpad: "런치패드",
    smartMoney: "스마트 머니",
    bugBounty: "버그 바운티",
    github: "Github",
    technicalSupport: "기술 지원",
    support: "지원",
    officialVerification: "공식 검증",
    productFeedback: "제품 피드백",
    apiManagement: "API 문서",
    helpCenter: "사용자 문서",
    customerSupport: "고객 서비스",
    selfService: "셀프 서비스",
    disconnectWallet: "지갑 연결 해제",
    dashboard: "데이터 대시보드",
    createMarket: "예측 시장 생성",
    fundManagement: "자금 관리",
    reward: "보상",
    accuracy: "정확도",
    leaderboard: "랭킹",
    terms: "이용약관",
    doc: "문서",
    walletAddressCopied: "지갑 주소가 클립보드에 복사되었습니다",
    copyFailed: "복사 실패, 수동으로 복사해 주세요"
  },
  settings: {
    title: "프로필",
    email: "이메일",
    emailPlaceholder: "이메일 주소를 입력해 주세요",
    emailHelper: "ChooseMe의 중요한 업데이트 정보를 수신하는 데 사용됩니다",
    username: "사용자명",
    usernamePlaceholder: "사용자명을 입력해 주세요",
    twitter: "트위터",
    bindTwitter: "연동",
    saveText: "저장"
  }
}

