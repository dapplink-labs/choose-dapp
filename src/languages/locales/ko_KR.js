import enUS from './en_US'

// 基于英文版结构的韩语占位文件：
// - 先复用 en_US 全量 key，保证不缺字段
// - 再按需覆盖已经有韩语文案的部分
const base = enUS

export default {
  ...base,
  assetManagement: {
    totalAssets: "총자산 평가",
    deposit: "입금",
    withdraw: "출금",
    bill: "명세",
    funds: "자금",
    earnings: "수익",
    fo: "FO",
    assetDistribution: "자산 분포",
    overview: "자산 요약",
    prediction: "예측",
    predictionPlaceholder: "예측 기능 준비 중...",
    name: "이름",
    quantity: "수량",
    value: "가치",
    profitLoss: "손익",
    rewards: "보상",
    winnings: "당첨",
    amountWon: "획득 금액",
    action: "작업",
    claim: "청구",
    searchPlaceholder: "컨트랙트, 시장 또는 코드를 검색",
    // 시간 주기
    timePeriod1d: "1일",
    timePeriod1w: "1주",
    timePeriod1m: "1개월",
    timePeriodAll: "전체",
    // 포지션 목록
    positionEvents: "포지션 이벤트",
    entrustedPositions: "위탁 포지션",
    historyPositionEvents: "역사 포지션 이벤트",
    all: "전체",
    buy: "Buy",
    sell: "Sell",
    // 상태
    lost: "lost",
    claimed: "claimed",
    // 기타
    valueLabel: "가치",
    search: "Search"
  },
  link: {
    titel: "지갑 연결",
    exit: "연결 해제",
    connectFailed: "지갑 연결에 실패했습니다. 다시 시도해주세요",
    signatureRequired: "지갑 연결에는 서명 인증이 필요합니다. 다시 연결하여 서명을 완료해주세요"
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
    loading: "로딩 중...",
    price: "가격",
    buy: "구매",
    share: "공유",
    noData: "데이터 없음...",
    address: "주소"
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
    tip: "* 초대 코드를 입력하면 더 많은 수익 보상을 받을 기회가 있습니다",
    codeRequired: "초대 코드는 필수입니다",
    bindSuccess: "초대 코드가 성공적으로 연동되었습니다",
    bindFail: "초대 코드 연동에 실패했습니다",
    bindFailed: "초대 코드 연동에 실패했습니다",
    contractBindSuccess: "온체인 초대 코드 연동에 성공했습니다",
    contractBindFailed: "온체인 초대 코드 연동에 실패했습니다",
    contractBindCancelled: "온체인 연동을 취소했습니다",
    invalidAddress: "유효하지 않은 초대 주소 형식입니다",
    missingContract: "NodeManager 컨트랙트 주소가 설정되어 있지 않습니다",
    inviterExists: "초대인이 존재하지 않습니다",
    bindInvitationTitle: "초대 관계 연동",
    bindInvitationDesc: "초대 관계를 연동하면 귀하의 계정이 초대인과 연결되어 스테이킹 및 예측 관련 보상 계산 및 지급에 사용됩니다.",
    myInvitationAddress: "나의 초대 주소",
    shareNow: "즉시 공유",
    invitationCodeCopied: "초대 코드가 클립보드에 복사되었습니다",
    noInvitationCode: "초대 코드 없음"
  },
  computingPower: {
    title: "노드 구매",
    desc: "노드를 구매하여 데이터 노드 수익, 거래 수수료 수익, 서브 토큰 수수료 수익, 2차 시장 수익을 누리고, 더 많은 노드 참여를 유도하여 더 많은 수익을 얻으세요.",
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
    activating: "활성화 중",
    purchased: "구매 완료",
    connectWalletFirst: "먼저 지갑을 연결하세요",
    activatingNode: "노드 활성화 중...",
    insufficientBalance: "잔액 부족!",
    requestingAuth: "USDT 승인 요청 중...",
    payingAndActivating: "결제 및 노드 활성화 중...",
    fetchNodeDataFailed: "노드 서비스 제공자 데이터 가져오기 실패",
    nodeActivationSuccess: "노드 활성화 성공!",
    paymentFailed: "결제 실패",
    paymentCancelled: "결제를 취소했습니다",
    products: {
      // 분산 노드 상세 소개
      distributedDescTemplate: "가벼운 Web3 노드 서비스로, 주요 체인을 지원하며 초기 프로젝트와 개인 개발자가 빠르게 참여하기에 적합합니다. 예측 플랫폼에 내장된 라이트 노드는 생태계 dApp 에 안정적인 온체인 데이터 조회와 트랜잭션 브로드캐스트를 제공합니다. 지금 친구들을 초대해서 더 많은 보상을 함께 받아 보세요.",
      // 클러스터 노드 상세 소개
      clusterDescTemplate: "고급 Web3 노드 서비스로, 주요 체인을 지원하며 예측 플랫폼의 핵심 인프라 역할을 합니다. 초고병렬 실시간 투자, 온체인 오라클 가격 피드 및 대형 상금 풀의 즉시 정산을 지원합니다. 지금 친구들을 초대해서 더 많은 보상을 함께 받아 보세요."
    }
  },
  lpVault: {
    title: "스테이킹 풀",
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
    days: "일",
    nodeTypeNotFound: "해당 노드 유형을 찾을 수 없습니다",
    invalidPrice: "노드 가격이 유효하지 않습니다",
    connectWalletFirst: "먼저 지갑을 연결하세요",
    activatingNode: "노드 활성화 중...",
    insufficientBalance: "잔액 부족",
    requestingAuth: "USDT 승인 요청 중...",
    approvalSuccess: "승인 성공",
    userCancelledAuth: "승인을 취소했습니다",
    approveTokenFailed: "승인 실패",
    nodeActivationSuccess: "노드 활성화 성공!",
    paymentFailed: "결제 실패",
    paymentCancelled: "결제를 취소했습니다",
    bindInviteCodeFirst: "먼저 초대 코드를 연동하세요"
  },
  myNodes: {
    title: "내 노드"
  },
  myNode: {
    title: "클러스터 노드",
    choIncome: "CHO 수익",
    subCoinIncome: "하위 코인 수익",
    earnPrompt: "주소 {address} 수익 획득",
    earnPromptShort: "수익 획득",
    pendingIncome: "수령 대기 수익",
    nodeIncome: "노드 수익",
    networkFeeIncome: "전체 네트워크 수수료 매매 수익",
    subCoinFeeIncome: "하위 코인 수수료 수익",
    secondaryMarketIncome: "2차 시장 이익 수익",
    directReferralIncome: "직접 추천 수익",
    networkIncome: "팀 수익",
    claimAll: "모든 수익 수령",
    claim: "수령",
    claimSuccess: "수령 성공",
    claimFailed: "수령 실패",
    claimCancelled: "수령을 취소했습니다",
    connectWalletFirst: "먼저 지갑을 연결하세요",
    missingContractAddress: "NodeManager 컨트랙트 주소가 없습니다",
    myTeam: "나의 팀",
    inviteAddressCount: "초대 주소 수",
    directAddressCount: "직접 추천 주소 수",
    teamTotalAddressCount: "팀 총 주소 수",
    directAddress: "직접 추천",
    teamAddress: "팀",
    activated: "활성화됨",
    nodeTypes: {
      distributed: "분산 노드",
      cluster: "클러스터 노드"
    }
  },
  myIncome: {
    title: "나의 수익",
    myIncomeCMT: "나의 수익(CHO)",
    computingPowerIncomeCMT: "해시 파워(Mining) 수익 (CHO)",
    networkIncomeCMT: "네트워크 수익 (CHO)",
    earnPrompt: "주소 {address} 수익 획득",
    pendingIncome: "지급된 보상",
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
    noStakingNode: "알림",
    noStakingNodeMessage: "스테이킹 노드가 아직 없습니다. 수익을 확인하려면 먼저 노드를 스테이킹해주세요",
    nodeNames: {
      infoNode: "정보 노드",
      dataNode: "데이터 노드",
      validationNode: "검증 노드",
      consensusNode: "합의 노드",
      genesisNode: "제네시스 노드"
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
    stakingPool: "노드 구매",
    lpVault: "스테이킹 풀",
    onChainData: "온체인 데이터",
    predictionMarket: "예측 시장 생성",
    assets: "온체인 자산",
    eventPool: "이벤트 풀",
    audit: "감사",
    developerDocs: "업데이트 로그",
    alpha: "Alpha 테스트",
    developerContributions: "개발자 기여",
    tokenomics: "토큰 이코노미 모델",
    launchpad: "태스크 플랫폼",
    smartMoney: "스마트 머니",
    bugBounty: "버그 바운티",
    github: "Github",
    technicalSupport: "기술 지원",
    language: "언어 전환",
    support: "기술 지원",
    officialVerification: "공식 검증",
    productFeedback: "제품 피드백",
    apiManagement: "API 관리",
    helpCenter: "헬프 센터",
    customerSupport: "온라인 고객센터",
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
    copyFailed: "복사 실패, 수동으로 복사해 주세요",
    linkCopied: "링크가 클립보드에 복사되었습니다",
    borrow: "빌리기",
    earn: "벌기",
    strategyTrading: "전략 거래",
    copyTrading: "복사 거래",
    airdrop: "에어드롭",
    academy: "아카데미",
    nft: "NFT",
    rwa: "RWA",
    underDevelopment: "개발 중입니다"
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
  },
  purchaseNodeRecord: {
    title: "노드 스테이킹 기록",
    nodeType: "노드 유형",
    nodePrice: "노드 가격",
    purchaseTime: "구매 시간",
    empty: "기록이 없습니다",
    informationNode: "정보 노드"
  },
  claimRecord: {
    title: "수령 기록",
    computingPowerService: "해시파워 서비스",
    lpVault: "스테이킹 풀",
    distributedNode: "분산 노드",
    clusterNode: "클러스터 노드"
  }
}

