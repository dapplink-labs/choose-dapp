<template>
    <div class="sports-events-h5-page">
        <!-- 顶部导航栏 (保持现状) -->
        <NavBar2 />

        <!-- 1. 体育子分类：使用您提供的原生 SVG -->
        <div class="sports-categories">
            <div v-for="category in sportsCategories" :key="category.guid || category.key" class="category-item"
                :class="{ active: selectedCategoryGuid ? selectedCategoryGuid === category.guid : activeCategory === category.key }"
                @click="handleCategoryClick(category)">
                <div class="category-icon-wrapper">
                    <div class="category-icon" :class="category.key">
                        <!-- 足球图标逻辑 (世界杯/足球) -->
                        <svg v-if="category.key === 'worldcup' || category.key === 'football'"
                            xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 20 20.001">
                            <path
                                d="M95.579,57.689l1.067-.667c-.4,0-.667-.133-1.067-.133H94.512Zm-7.863,6,2.8,1.067,4.531-3.067.133-3.067-2-1.467a10.317,10.317,0,0,0-6.262,4.267l.8,2.267Zm7.73-1.2-4.264,2.933,1.465,5.067,5.2.133,1.732-4.933-4.131-3.2Zm.533-3.867v3.067l4.261,3.2,2.932-.933.8-2.133a10.52,10.52,0,0,0-6-4.667l-2,1.467Zm-9.33,5.2-.4-1.2a7.71,7.71,0,0,0-.667,1.867Zm17.855.8-.133-.933-.267.667Zm-2.8,9.867h-1.333l-.4,1.2A5.074,5.074,0,0,0,101.707,74.489Zm1.732-9.467-2.8.8-1.865,5.2,1.733,2.533h2.264a9.436,9.436,0,0,0,2.532-6.4v-.667l-1.867-1.467ZM89.848,73.156l1.867-2.267-1.6-5.2-2.931-1.067-1.867,1.333v.8a10.387,10.387,0,0,0,2.133,6.534Zm-1.465.933a6.268,6.268,0,0,0,1.6,1.2l-.4-1.2Zm11.194-.133-1.6-2.267-5.6-.133-1.865,2.4.8,2.133a8.94,8.94,0,0,0,3.731.8,8.828,8.828,0,0,0,3.731-.667Z"
                                transform="translate(-85.305 -56.889)" fill="currentColor" />
                        </svg>
                        <!-- 篮球图标逻辑 (NBA/篮球) -->
                        <svg v-else-if="category.key === 'nba' || category.key === 'basketball'"
                            xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 20 19.999">
                            <path
                                d="M180.016,170.921a7.381,7.381,0,0,1-1.391,6.813l2.216,2.216,6.582-6.582A9.957,9.957,0,0,0,180.016,170.921ZM190.81,181.67a9.975,9.975,0,0,0-2.45-7.368l-6.583,6.583,2.155,2.155A7.383,7.383,0,0,1,190.81,181.67ZM184.891,184l3.47,3.469A9.934,9.934,0,0,0,190.614,183,6.075,6.075,0,0,0,184.891,184Zm-1.936,6.66a9.9,9.9,0,0,0,4.471-2.254l-3.47-3.47a6.071,6.071,0,0,0-1,5.724Zm-6.226-12.95-3.407-3.407a9.932,9.932,0,0,0-2.246,4.434A6.07,6.07,0,0,0,176.729,177.709ZM183,183.977l-2.155-2.156-6.584,6.584a9.958,9.958,0,0,0,7.369,2.448A7.369,7.369,0,0,1,183,183.977Zm-12.122-3.918a9.966,9.966,0,0,0,2.447,7.41l6.584-6.583-2.218-2.217A7.376,7.376,0,0,1,170.875,180.059Zm7.817-8.938a9.956,9.956,0,0,0-4.434,2.245l3.408,3.408A6.066,6.066,0,0,0,178.692,171.122Z"
                                transform="translate(-170.841 -170.886)" fill="currentColor" />
                        </svg>
                    </div>
                    <div v-if="category.badge > 0" class="category-badge">{{ category.badge }}</div>
                </div>
                <div class="category-label">{{ category.label }}</div>
            </div>
        </div>

        <div class="main-body">
            <!-- 2. 标题与日期选择 -->
            <div class="nba-title-row">
                <div class="title-left">
                    <!-- 世界杯/足球图标 -->
                    <div v-if="activeCategory === 'worldcup' || activeCategory === 'football'"
                        class="icon-circle orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20.001">
                            <path
                                d="M95.579,57.689l1.067-.667c-.4,0-.667-.133-1.067-.133H94.512Zm-7.863,6,2.8,1.067,4.531-3.067.133-3.067-2-1.467a10.317,10.317,0,0,0-6.262,4.267l.8,2.267Zm7.73-1.2-4.264,2.933,1.465,5.067,5.2.133,1.732-4.933-4.131-3.2Zm.533-3.867v3.067l4.261,3.2,2.932-.933.8-2.133a10.52,10.52,0,0,0-6-4.667l-2,1.467Zm-9.33,5.2-.4-1.2a7.71,7.71,0,0,0-.667,1.867Zm17.855.8-.133-.933-.267.667Zm-2.8,9.867h-1.333l-.4,1.2A5.074,5.074,0,0,0,101.707,74.489Zm1.732-9.467-2.8.8-1.865,5.2,1.733,2.533h2.264a9.436,9.436,0,0,0,2.532-6.4v-.667l-1.867-1.467ZM89.848,73.156l1.867-2.267-1.6-5.2-2.931-1.067-1.867,1.333v.8a10.387,10.387,0,0,0,2.133,6.534Zm-1.465.933a6.268,6.268,0,0,0,1.6,1.2l-.4-1.2Zm11.194-.133-1.6-2.267-5.6-.133-1.865,2.4.8,2.133a8.94,8.94,0,0,0,3.731.8,8.828,8.828,0,0,0,3.731-.667Z"
                                transform="translate(-85.305 -56.889)" fill="currentColor" />
                        </svg>
                    </div>
                    <!-- NBA/篮球图标 -->
                    <div v-else class="icon-circle blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 19.999">
                            <path
                                d="M180.016,170.921a7.381,7.381,0,0,1-1.391,6.813l2.216,2.216,6.582-6.582A9.957,9.957,0,0,0,180.016,170.921ZM190.81,181.67a9.975,9.975,0,0,0-2.45-7.368l-6.583,6.583,2.155,2.155A7.383,7.383,0,0,1,190.81,181.67ZM184.891,184l3.47,3.469A9.934,9.934,0,0,0,190.614,183,6.075,6.075,0,0,0,184.891,184Zm-1.936,6.66a9.9,9.9,0,0,0,4.471-2.254l-3.47-3.47a6.071,6.071,0,0,0-1,5.724Zm-6.226-12.95-3.407-3.407a9.932,9.932,0,0,0-2.246,4.434A6.07,6.07,0,0,0,176.729,177.709ZM183,183.977l-2.155-2.156-6.584,6.584a9.958,9.958,0,0,0,7.369,2.448A7.369,7.369,0,0,1,183,183.977Zm-12.122-3.918a9.966,9.966,0,0,0,2.447,7.41l6.584-6.583-2.218-2.217A7.376,7.376,0,0,1,170.875,180.059Zm7.817-8.938a9.956,9.956,0,0,0-4.434,2.245l3.408,3.408A6.066,6.066,0,0,0,178.692,171.122Z"
                                transform="translate(-170.841 -170.886)" fill="currentColor" />
                        </svg>
                    </div>
                    <span>{{ currentCategoryTitle }}</span>
                </div>
                <div class="day-pill">
                    {{ $t('sportsEvents.matchDay') }} {{ selectedMatchday }} <el-icon class="ml-1">
                        <ArrowDown />
                    </el-icon>
                </div>
            </div>

            <!-- 3. 类型切换 Tab -->
            <div class="type-tabs">
                <button class="tab-btn" :class="{ active: activeTab === 'match' }" @click="handleTabClick('match')">{{
                    $t('sportsEvents.match') }}</button>
                <button class="tab-btn" :class="{ active: activeTab === 'player' }" @click="handleTabClick('player')">{{
                    activeCategory === 'worldcup' || activeCategory === 'football' ? $t('sportsEvents.playerMarket') :
                        $t('sportsEvents.props') }}</button>
            </div>

            <!-- 4. 赛事列表 - NBA/篮球（只在“比赛” Tab 下渲染） -->
            <div v-if="(activeCategory === 'nba' || activeCategory === 'basketball') && activeTab === 'match'"
                class="event-list">
                <div v-if="eventsLoading" class="list-loading">{{ $t('common.loading') || 'Loading...' }}</div>
                <div v-else-if="!eventsList.length" class="list-empty">{{ $t('common.noData') || 'No data' }}</div>
                <div v-for="(event, idx) in eventsList" :key="idx" class="event-wrapper">
                    <div v-if="event.month" class="date-label">{{ formatDate(event.month, event.day, event.weekday) }}
                    </div>

                    <div class="event-card">
                        <div class="card-meta">
                            <div class="meta-left">
                                <span class="time-tag">{{ event.time }}</span>
                                <span class="vol-text">{{ event.volume }} {{ $t('sports.volume') }}</span>
                            </div>
                            <button class="view-btn" type="button" @click.stop="handleGameView(event)">
                                {{ $t('sportsEvents.gameView') }} <span class="arrow">›</span>
                            </button>
                        </div>

                        <div class="teams-box">
                            <div class="team-line">
                                <img :src="event.team1.logo" class="logo-img" />
                                <span class="name">{{ event.team1.name }}</span>
                                <span class="record">{{ event.team1.record }}</span>
                            </div>
                            <div class="team-line">
                                <img :src="event.team2.logo" class="logo-img" />
                                <span class="name">{{ event.team2.name }}</span>
                                <span class="record">{{ event.team2.record }}</span>
                            </div>
                        </div>

                        <div class="bet-row">
                            <button class="odds-btn knicks" type="button" @click.stop="openPayment(event, 'team1')">
                                {{ event.team1.shortName }} {{ event.team1.odds }}¢
                            </button>
                            <button class="odds-btn lakers" type="button" @click.stop="openPayment(event, 'team2')">
                                {{ event.team2.shortName }} {{ event.team2.odds }}¢
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. 赛事列表 - 世界杯/足球 比赛 -->
            <div v-if="(activeCategory === 'worldcup' || activeCategory === 'football') && activeTab === 'match'"
                class="event-list worldcup-list">
                <div v-if="eventsLoading" class="list-loading">{{ $t('common.loading') || 'Loading...' }}</div>
                <div v-else-if="!worldcupEventsList.length" class="list-empty">{{ $t('common.noData') || 'No data' }}
                </div>
                <div v-for="(event, idx) in worldcupEventsList" :key="idx" class="event-wrapper">
                    <div v-if="event.month" class="date-label">{{ formatDate(event.month, event.day, event.weekday) }}
                    </div>

                    <div class="event-card worldcup-card">
                        <div class="card-meta">
                            <div class="meta-left">
                                <span class="time-tag">{{ event.time }}</span>
                                <span class="vol-text">{{ event.volume }} {{ $t('sports.volume') }}</span>
                            </div>
                            <button class="view-btn" type="button" @click.stop="handleGameView(event)">
                                {{ $t('sportsEvents.gameView') }} <span class="arrow">›</span>
                            </button>
                        </div>

                        <div class="teams-box worldcup-teams">
                            <div class="team-line">
                                <img :src="event.team1.logo" class="logo-img" />
                                <span class="short-name">{{ event.team1.shortName }}</span>
                                <span class="full-name">{{ event.team1.name }}</span>
                                <span class="record">{{ event.team1.record }}</span>
                            </div>
                            <div class="team-line">
                                <img :src="event.team2.logo" class="logo-img" />
                                <span class="short-name">{{ event.team2.shortName }}</span>
                                <span class="full-name">{{ event.team2.name }}</span>
                                <span class="record">{{ event.team2.record }}</span>
                            </div>
                        </div>

                        <div class="bet-row three-btns">
                            <button class="odds-btn btn-yellow" type="button" @click.stop="openPayment(event, 'team1')">
                                {{ event.team1.shortName }} {{ event.team1.odds }} ¢
                            </button>
                            <button class="odds-btn btn-gray" type="button" @click.stop="openPayment(event, 'draw')">
                                DET {{ event.drawOdds }} ¢
                            </button>
                            <button class="odds-btn btn-pink" type="button" @click.stop="openPayment(event, 'team2')">
                                {{ event.team2.shortName }} {{ event.team2.odds }} ¢
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. 球员盘列表 - 世界杯/足球 -->
            <div v-if="(activeCategory === 'worldcup' || activeCategory === 'football') && activeTab === 'player'"
                class="player-panel-list">
                <div v-for="(item, idx) in playerPanelList" :key="idx" class="player-card">
                    <div class="card-header">
                        <img :src="item.avatar" class="card-avatar" />
                        <div class="card-title">{{ item.title }}</div>
                    </div>
                    <div class="card-leverage">
                        <div class="leverage-item">
                            <span class="label">{{ $t('sportsEvents.maxLeverage') }}:</span>
                            <span class="value">{{ item.maxLeverage }}</span>
                        </div>
                        <div class="leverage-item">
                            <span class="label">{{ $t('sportsEvents.maxReturn') }}:</span>
                            <span class="value">{{ item.maxReturn }}</span>
                        </div>
                    </div>
                    <div class="card-options">
                        <div v-for="(opt, optIdx) in item.options" :key="optIdx" class="option-row">
                            <div class="option-info">
                                <span class="option-name">{{ opt.name }}</span>
                                <span class="option-percent">{{ opt.percent }}</span>
                            </div>
                            <div class="option-btns">
                                <button class="opt-btn yes" @click="openPayment(item, 'yes')">Yes</button>
                                <button class="opt-btn no" @click="openPayment(item, 'no')">No</button>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="footer-left">
                            <span class="time-info">
                                <svg class="time-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12"
                                    height="12" viewBox="0 0 12 12">
                                    <path
                                        d="M75.818,69.818a6,6,0,1,1-6,6A6,6,0,0,1,75.818,69.818ZM75.66,72.66a.474.474,0,0,0-.474.474v2.842a.474.474,0,0,0,.474.474H78.5a.474.474,0,1,0,0-.947H76.134V73.134A.474.474,0,0,0,75.66,72.66Z"
                                        transform="translate(-69.818 -69.818)" fill="currentColor" />
                                </svg>
                                {{ item.timeRemaining }}
                            </span>
                            <span class="participant-info">
                                <el-icon class="user-icon">
                                    <Avatar />
                                </el-icon>
                                {{ item.participantCount.toLocaleString() }}
                            </span>
                            <span class="voi-info">VOI：${{ item.amount }}</span>
                        </div>
                        <svg class="bookmark-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14"
                            height="14">
                            <path
                                d="M389.461333 85.333333l253.354667 0.021334c5.397333 0.042667 10.602667 0.128 15.616 0.256l14.506667 0.490666 13.482666 0.789334c43.306667 3.072 71.104 10.965333 99.733334 26.282666a197.738667 197.738667 0 0 1 82.005333 82.005334c15.317333 28.629333 23.210667 56.426667 26.282667 99.733333l0.789333 13.482667 0.490667 14.506666 0.149333 7.658667 0.128 16.213333v501.525334a85.333333 85.333333 0 0 1-123.498667 76.330666L518.186667 797.44l-3.2-1.557333-2.965334-1.322667-2.986666 1.322667-257.514667 128.725333A85.333333 85.333333 0 0 1 128 848.298667l0.021333-509.781334c0.042667-5.397333 0.128-10.602667 0.256-15.616l0.490667-14.506666 0.789333-13.482667c3.072-43.306667 10.965333-71.104 26.282667-99.733333a197.738667 197.738667 0 0 1 82.005333-82.005334c28.629333-15.317333 56.426667-23.210667 99.733334-26.282666l13.482666-0.789334 14.506667-0.490666 7.658667-0.149334 16.213333-0.128z m252.16 85.354667H382.378667l-13.184 0.170667-6.122667 0.149333-11.413333 0.426667-10.325334 0.64c-4.906667 0.384-9.493333 0.832-13.76 1.365333l-8.149333 1.173333c-11.712 1.92-21.12 4.650667-29.866667 8.32l-5.76 2.602667c-1.92 0.917333-3.797333 1.877333-5.674666 2.88a112.426667 112.426667 0 0 0-47.018667 47.018667 145.664 145.664 0 0 0-2.88 5.674666l-2.602667 5.76c-3.669333 8.746667-6.4 18.154667-8.32 29.866667l-1.173333 8.149333c-0.533333 4.266667-0.981333 8.832-1.344 13.76l-0.64 10.325334a514.133333 514.133333 0 0 0-0.256 5.546666l-0.341333 11.989334-0.170667 13.184L213.333333 848.277333l256.469334-128.170666c10.965333-5.312 18.112-7.850667 26.88-9.536a80.213333 80.213333 0 0 1 30.634666 0c9.856 1.898667 17.664 4.885333 31.189334 11.648L810.666667 848.298667l-0.021334-508.586667-0.170666-13.226667a709.973333 709.973333 0 0 0-0.149334-6.101333l-0.426666-11.413333-0.64-10.325334c-0.384-4.906667-0.832-9.493333-1.365334-13.76l-1.173333-8.149333a129.984 129.984 0 0 0-8.32-29.866667l-2.602667-5.76a145.664 145.664 0 0 0-2.88-5.674666 112.426667 112.426667 0 0 0-47.018666-47.018667 145.664 145.664 0 0 0-5.674667-2.88l-5.76-2.602667c-8.746667-3.669333-18.154667-6.4-29.866667-8.32l-8.149333-1.173333c-4.266667-0.533333-8.832-0.981333-13.76-1.344l-10.325333-0.64a514.133333 514.133333 0 0 0-5.546667-0.256l-11.989333-0.341333L641.642667 170.666667zM576 298.666667a42.666667 42.666667 0 0 1 3.2 85.226666L576 384h-128a42.666667 42.666667 0 0 1-3.2-85.226667L448 298.666667h128z"
                                fill="#909090" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- 4. 球员盘列表 - NBA/篮球（属性/Props Tab） -->
            <div v-if="(activeCategory === 'nba' || activeCategory === 'basketball') && activeTab === 'player'"
                class="player-panel-list">
                <div v-for="(item, idx) in nbaPlayerPanelList" :key="idx" class="player-card">
                    <div class="card-header">
                        <img :src="item.avatar" class="card-avatar" />
                        <div class="card-title">{{ item.title }}</div>
                    </div>
                    <div class="card-leverage">
                        <div class="leverage-item">
                            <span class="label">{{ $t('sportsEvents.maxLeverage') }}:</span>
                            <span class="value">{{ item.maxLeverage }}</span>
                        </div>
                        <div class="leverage-item">
                            <span class="label">{{ $t('sportsEvents.maxReturn') }}:</span>
                            <span class="value">{{ item.maxReturn }}</span>
                        </div>
                    </div>
                    <div class="card-options">
                        <div v-for="(opt, optIdx) in item.options" :key="optIdx" class="option-row">
                            <div class="option-info">
                                <span class="option-name">{{ opt.name }}</span>
                                <span class="option-percent">{{ opt.percent }}</span>
                            </div>
                            <div class="option-btns">
                                <button class="opt-btn yes" @click="openPayment(item, 'yes')">Yes</button>
                                <button class="opt-btn no" @click="openPayment(item, 'no')">No</button>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="footer-left">
                            <span class="time-info">
                                <svg class="time-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12"
                                    height="12" viewBox="0 0 12 12">
                                    <path
                                        d="M75.818,69.818a6,6,0,1,1-6,6A6,6,0,0,1,75.818,69.818ZM75.66,72.66a.474.474,0,0,0-.474.474v2.842a.474.474,0,0,0,.474.474H78.5a.474.474,0,1,0,0-.947H76.134V73.134A.474.474,0,0,0,75.66,72.66Z"
                                        transform="translate(-69.818 -69.818)" fill="currentColor" />
                                </svg>
                                {{ item.timeRemaining }}
                            </span>
                            <span class="participant-info">
                                <el-icon class="user-icon">
                                    <Avatar />
                                </el-icon>
                                {{ item.participantCount.toLocaleString() }}
                            </span>
                            <span class="voi-info">VOI：${{ item.amount }}</span>
                        </div>
                        <svg class="bookmark-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14"
                            height="14">
                            <path
                                d="M389.461333 85.333333l253.354667 0.021334c5.397333 0.042667 10.602667 0.128 15.616 0.256l14.506667 0.490666 13.482666 0.789334c43.306667 3.072 71.104 10.965333 99.733334 26.282666a197.738667 197.738667 0 0 1 82.005333 82.005334c15.317333 28.629333 23.210667 56.426667 26.282667 99.733333l0.789333 13.482667 0.490667 14.506666 0.149333 7.658667 0.128 16.213333v501.525334a85.333333 85.333333 0 0 1-123.498667 76.330666L518.186667 797.44l-3.2-1.557333-2.965334-1.322667-2.986666 1.322667-257.514667 128.725333A85.333333 85.333333 0 0 1 128 848.298667l0.021333-509.781334c0.042667-5.397333 0.128-10.602667 0.256-15.616l0.490667-14.506666 0.789333-13.482667c3.072-43.306667 10.965333-71.104 26.282667-99.733333a197.738667 197.738667 0 0 1 82.005333-82.005334c28.629333-15.317333 56.426667-23.210667 99.733334-26.282666l13.482666-0.789334 14.506667-0.490666 7.658667-0.149334 16.213333-0.128z m252.16 85.354667H382.378667l-13.184 0.170667-6.122667 0.149333-11.413333 0.426667-10.325334 0.64c-4.906667 0.384-9.493333 0.832-13.76 1.365333l-8.149333 1.173333c-11.712 1.92-21.12 4.650667-29.866667 8.32l-5.76 2.602667c-1.92 0.917333-3.797333 1.877333-5.674666 2.88a112.426667 112.426667 0 0 0-47.018667 47.018667 145.664 145.664 0 0 0-2.88 5.674666l-2.602667 5.76c-3.669333 8.746667-6.4 18.154667-8.32 29.866667l-1.173333 8.149333c-0.533333 4.266667-0.981333 8.832-1.344 13.76l-0.64 10.325334a514.133333 514.133333 0 0 0-0.256 5.546666l-0.341333 11.989334-0.170667 13.184L213.333333 848.277333l256.469334-128.170666c10.965333-5.312 18.112-7.850667 26.88-9.536a80.213333 80.213333 0 0 1 30.634666 0c9.856 1.898667 17.664 4.885333 31.189334 11.648L810.666667 848.298667l-0.021334-508.586667-0.170666-13.226667a709.973333 709.973333 0 0 0-0.149334-6.101333l-0.426666-11.413333-0.64-10.325334c-0.384-4.906667-0.832-9.493333-1.365334-13.76l-1.173333-8.149333a129.984 129.984 0 0 0-8.32-29.866667l-2.602667-5.76a145.664 145.664 0 0 0-2.88-5.674666 112.426667 112.426667 0 0 0-47.018666-47.018667 145.664 145.664 0 0 0-5.674667-2.88l-5.76-2.602667c-8.746667-3.669333-18.154667-6.4-29.866667-8.32l-8.149333-1.173333c-4.266667-0.533333-8.832-0.981333-13.76-1.344l-10.325333-0.64a514.133333 514.133333 0 0 0-5.546667-0.256l-11.989333-0.341333L641.642667 170.666667zM576 298.666667a42.666667 42.666667 0 0 1 3.2 85.226666L576 384h-128a42.666667 42.666667 0 0 1-3.2-85.226667L448 298.666667h128z"
                                fill="#909090" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 购买弹窗 -->
    <PaymentModal v-model="showPayment" />

    <!-- 联赛选择器 -->
    <LeagueSelector v-model:visible="showLeagueSelector" :selected-league="selectedLeague"
        @select="handleLeagueSelect" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Avatar } from '@element-plus/icons-vue'
import tyIcon01 from '@/assets/icon/tyIcon01.png'
import tyIcon02 from '@/assets/icon/tyIcon02.png'
import NavBar2 from '@/components/navBar2.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import LeagueSelector from './LeagueSelector.vue'
import { getCategoryList, getEventList } from '@/api/APIEvent'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const activeCategory = ref('nba')
const selectedCategoryGuid = ref('')
const selectedMatchday = ref(9)
const activeTab = ref('match')

const showPayment = ref(false)
const selectedEvent = ref(null)
const selectedSide = ref(null)

// 联赛选择器状态
const showLeagueSelector = ref(false)
const selectedLeague = ref('')

// URL 传入的分类 ID
const urlCategoryGuid = computed(() => route.query.category_guid || '')

// 动态分类数据
const dynamicCategories = ref([])

// 获取分类列表
const fetchCategories = async () => {
    try {
        const lang = locale.value === 'zh-cn' ? 'zh' :
            locale.value === 'ko-kr' ? 'ko' :
                locale.value === 'ja-jp' ? 'ja' : 'en'

        const params = { language_label: lang }
        // 有 URL 分类ID时，按父分类ID查询其二级分类
        if (urlCategoryGuid.value) {
            params.parent_category_guid = urlCategoryGuid.value
        } else {
            // 无父分类ID时兜底查询二级分类
            params.level = 1
        }

        const res = await getCategoryList(params)

        const categoryList = Array.isArray(res?.data?.categories)
            ? res.data.categories
            : Array.isArray(res?.data?.data?.categories)
                ? res.data.data.categories
                : []

        if ((res?.data?.code === 200 || res?.data?.code === 2000) && categoryList.length > 0) {
            // 将二级分类接口数据映射到页面分类结构
            dynamicCategories.value = categoryList.map(item => {
                const guid = item.category_guid || item.guid || ''
                const label = item.category_name || item.name || ''
                const code = (item.code || '').toLowerCase()
                let key = guid
                const name = label.toLowerCase()

                // 常见的子分类逻辑：如果名称包含 NBA 则设为 nba key 以复用图标
                if (name.includes('nba') || code === 'nba') key = 'nba'
                else if (name.includes('world cup') || name.includes('世界杯') || code === 'worldcup') key = 'worldcup'
                else if (name.includes('soccer') || name.includes('football') || name.includes('足球') || code === 'football') key = 'football'
                else if (name.includes('basketball') || name.includes('篮球') || code === 'basketball') key = 'basketball'

                return {
                    key: key,
                    guid,
                    label,
                    badge: 0
                }
            }).filter(item => !!item.guid)

            // 自动选中第一个有效分类
            if (dynamicCategories.value.length > 0) {
                const byGuid = dynamicCategories.value.find(c => c.guid === selectedCategoryGuid.value)
                const byKey = dynamicCategories.value.find(c => c.key === activeCategory.value)
                const target = byGuid || byKey || dynamicCategories.value[0]
                activeCategory.value = target.key
                selectedCategoryGuid.value = target.guid
            }
        } else {
            dynamicCategories.value = []
        }
    } catch (error) {
        console.error('Fetch categories failed:', error)
        dynamicCategories.value = []
    }
    // 分类加载完毕后立即拉取赛事（无论成功与否，保证入口调用）
    await fetchSportsEvents()
}

onMounted(async () => {
    await fetchCategories()
})

// 计算当前分类标题
const currentCategoryTitle = computed(() => {
    const found = dynamicCategories.value.find(c => c.guid === selectedCategoryGuid.value)
    if (found) return found.label

    const categoryMap = {
        'worldcup': t('sportsEvents.worldCup'),
        'nba': 'NBA',
        'football': t('sportsEvents.football'),
        'basketball': t('sportsEvents.basketball')
    }
    return categoryMap[activeCategory.value] || 'NBA'
})

const handleTabClick = (tab) => {
    activeTab.value = tab
    fetchSportsEvents()
}

const handleCategoryClick = (category) => {
    activeCategory.value = category.key
    selectedCategoryGuid.value = category.guid
    activeTab.value = 'match' // 切换分类时重置 tab
    fetchSportsEvents()
}

const handleLeagueSelect = (league) => {
    selectedLeague.value = league.id
    console.log('选择联赛:', league.name)
}

// 日期格式化函数
const formatDate = (month, day, weekdayKey) => {
    if (!month || !day) return ''
    const weekday = t(`sportsEvents.weekdays.${weekdayKey}`)
    const monthName = t(`detail.months.${month}`)
    return t('sportsEvents.dateFormat', { weekday, month: monthName, day })
}

const handleGameView = (event) => {
    router.push('/sports-detail-h5')
}

const openPayment = (event, side) => {
    selectedEvent.value = event
    selectedSide.value = side
    showPayment.value = true
}

const sportsCategories = computed(() => {
    // 优先使用动态获取的分类，如果还没有获取到，可以保留几个默认的兜底
    if (dynamicCategories.value.length > 0) {
        return dynamicCategories.value
    }

    return [
        { key: 'worldcup', label: t('sportsEvents.worldCup'), badge: 14 },
        { key: 'nba', label: 'NBA', badge: 32 },
        { key: 'football', label: t('sportsEvents.football'), badge: 0 },
        { key: 'basketball', label: t('sportsEvents.basketball'), badge: 0 }
    ]
})

// 加载状态
const eventsLoading = ref(false)

// 将接口返回的 event 对象映射为页面所需格式
const mapApiEventToCard = (e, isFirstOfDay) => {
    const subEvents = Array.isArray(e.sub_events) ? e.sub_events : []
    const team1 = subEvents[0] || {}
    const team2 = subEvents[1] || {}

    // 解析 open_time: "2026-01-05 04:00:00"
    let month = '', day = '', weekday = '', timeStr = ''
    if (e.open_time) {
        const dt = new Date(e.open_time.replace(' ', 'T'))
        if (!isNaN(dt.getTime())) {
            const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            const weekdayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
            if (isFirstOfDay) {
                month = monthKeys[dt.getMonth()]
                day = dt.getDate()
                weekday = weekdayKeys[dt.getDay()]
            }
            const h = dt.getHours()
            const m = String(dt.getMinutes()).padStart(2, '0')
            const ampm = h >= 12 ? 'PM' : 'AM'
            const h12 = h % 12 || 12
            timeStr = `${h12}:${m} ${ampm}`
        }
    }

    const volumeNum = Number(e.trade_volume)
    const volumeStr = Number.isFinite(volumeNum)
        ? '$' + volumeNum.toLocaleString('en-US', { maximumFractionDigits: 0 })
        : '--'

    // 获取赔率（0-100 整数显示，若接口有 price 字段则用，否则均分）
    const getOdds = (sub) => {
        if (sub.price !== undefined && sub.price !== null) {
            return String(Math.round(Number(sub.price) * 100))
        }
        return '50'
    }

    return {
        // 日期分组标识（仅当日首条时有值）
        month,
        day,
        weekday,
        time: timeStr,
        volume: volumeStr,
        // 三选一赛事（足球/世界杯）置 drawOdds
        drawOdds: subEvents[2] ? getOdds(subEvents[2]) : (subEvents.length === 3 ? '33' : ''),
        // 原始 guid，供跳转使用
        eventGuid: e.event_guid || '',
        team1: {
            name: team1.title || '',
            shortName: (team1.title || '').slice(0, 3).toUpperCase(),
            record: '',
            logo: team1.logo || e.logo || '',
            odds: getOdds(team1)
        },
        team2: {
            name: team2.title || '',
            shortName: (team2.title || '').slice(0, 3).toUpperCase(),
            record: '',
            logo: team2.logo || e.logo || '',
            odds: getOdds(team2)
        }
    }
}

// 将事件列表按日期分组并注入 month/day/weekday 标识
const groupEventsByDate = (events) => {
    const seen = new Set()
    return events.map((e) => {
        const dateKey = e.open_time ? e.open_time.slice(0, 10) : ''
        const isFirst = dateKey && !seen.has(dateKey)
        if (isFirst) seen.add(dateKey)
        return mapApiEventToCard(e, isFirst)
    })
}

// NBA/篮球 赛事列表
const eventsList = ref([])

// 世界杯/足球 赛事列表
const worldcupEventsList = ref([])

// 获取体育赛事列表（根据当前分类 + 当前 Tab）
const fetchSportsEvents = async () => {
    const categoryGuid = selectedCategoryGuid.value
    console.log('Fetching sports events for categoryGuid:', categoryGuid, 'tab:', activeTab.value)
    if (!categoryGuid) return

    eventsLoading.value = true
    try {
        const lang = locale.value === 'zh-cn' ? 'zh'
            : locale.value === 'ko-kr' ? 'ko'
                : locale.value === 'ja-jp' ? 'ja' : 'en'

        const isFootball = activeCategory.value === 'worldcup' || activeCategory.value === 'football'

        const baseParams = {
            language_label: lang,
            include_sub_events: true,
            page: 1,
            page_size: 20,
            category_guid: categoryGuid
        }

        if (activeTab.value === 'match') {
            // 比赛 Tab：拉取赛事列表
            const res = await getEventList({ ...baseParams })
            const list = res?.data?.data?.events || res?.data?.events || []
            const mapped = groupEventsByDate(list)

            if (isFootball) {
                worldcupEventsList.value = mapped
            } else {
                eventsList.value = mapped
            }
        } else if (activeTab.value === 'player') {
            const res = await getEventList({ ...baseParams })
            const list = res?.data?.data?.events || res?.data?.events || []
            const mapped = list.map(mapApiToPlayerItem)

            if (isFootball) {
                playerPanelList.value = mapped.length ? mapped : playerPanelList.value
            } else {
                nbaPlayerPanelList.value = mapped.length ? mapped : nbaPlayerPanelList.value
            }
        }
    } catch (err) {
        console.error('Fetch sports events failed:', err)
    } finally {
        eventsLoading.value = false
    }
}

// 将接口球员盘事件映射为页面所需格式
const mapApiToPlayerItem = (e) => {
    const subEvents = Array.isArray(e.sub_events) ? e.sub_events : []
    const totalPrice = subEvents.reduce((sum, s) => sum + Number(s.price || 0), 0)
    const options = subEvents.map(s => ({
        name: s.title || '',
        percent: totalPrice > 0
            ? Math.round((Number(s.price || 0) / totalPrice) * 100) + '%'
            : '--'
    }))

    const volumeNum = Number(e.trade_volume)
    const amountStr = Number.isFinite(volumeNum)
        ? volumeNum >= 1_000_000
            ? (volumeNum / 1_000_000).toFixed(1) + 'M'
            : volumeNum >= 1_000
                ? (volumeNum / 1_000).toFixed(0) + 'K'
                : String(volumeNum)
        : '--'

    // 剩余时间（从 close_time 计算）
    let timeRemaining = '--'
    if (e.close_time) {
        const diff = new Date(e.close_time.replace(' ', 'T')).getTime() - Date.now()
        if (diff > 0) {
            const h = Math.floor(diff / 3_600_000)
            const m = Math.floor((diff % 3_600_000) / 60_000)
            timeRemaining = h > 0 ? `${h}h ${m}m left` : `${m}m left`
        }
    }

    return {
        avatar: e.logo || '',
        title: e.title || e.event_title || '',
        maxLeverage: e.max_leverage ? `${e.max_leverage}x` : '--',
        maxReturn: e.max_return ? `${Math.round(Number(e.max_return) * 100)}%` : '--',
        options,
        timeRemaining,
        participantCount: Number(e.participant_count) || 0,
        amount: amountStr
    }
}

// 球员盘列表
const playerPanelList = ref([
    {
        avatar: tyIcon01,
        title: '2026 FIFA 世界杯冠军',
        maxLeverage: '10X',
        maxReturn: '182%',
        options: [
            { name: '西班牙', percent: '82%' },
            { name: '葡萄牙', percent: '32%' }
        ],
        timeRemaining: '04:30:57',
        participantCount: 1280,
        amount: '19.00'
    },
    {
        avatar: tyIcon01,
        title: '2026 FIFA 世界杯 最佳射手',
        maxLeverage: '10X',
        maxReturn: '182%',
        options: [
            { name: '姆巴佩', percent: '82%' },
            { name: '罗伯特·莱万多夫斯基', percent: '18%' }
        ],
        timeRemaining: '04:30:57',
        participantCount: 1280,
        amount: '19.00'
    },
    {
        avatar: tyIcon01,
        title: '2026 FIFA 世界杯 金球奖',
        maxLeverage: '8X',
        maxReturn: '156%',
        options: [
            { name: '梅西', percent: '65%' },
            { name: 'C罗', percent: '35%' }
        ],
        timeRemaining: '02:15:30',
        participantCount: 890,
        amount: '25.50'
    }
])

// NBA / 篮球球员盘示例数据
const nbaPlayerPanelList = ref([
    {
        avatar: tyIcon01,
        title: 'LeBron James total points vs Knicks',
        maxLeverage: '5x',
        maxReturn: '120%',
        timeRemaining: '4h 21m left',
        participantCount: 3284,
        amount: '1.2M',
        options: [
            { name: 'Over 28.5 pts', percent: '62% implied' },
            { name: 'Under 28.5 pts', percent: '38% implied' }
        ]
    },
    {
        avatar: tyIcon02,
        title: 'J. Brunson 3-pointers made',
        maxLeverage: '4x',
        maxReturn: '95%',
        timeRemaining: '3h 10m left',
        participantCount: 1875,
        amount: '620K',
        options: [
            { name: 'Over 3.5 3PM', percent: '44% implied' },
            { name: 'Under 3.5 3PM', percent: '56% implied' }
        ]
    }
])
</script>

<style scoped lang="scss">
// 全局防止横向滚动
:deep(body),
:deep(html) {
    overflow-x: hidden !important;
    max-width: 100vw !important;
}

.sports-events-h5-page {
    background-color: var(--bg-page-h5);
    min-height: 100vh;
    padding-top: 50px;
    color: var(--bg-opposite);
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
    position: relative;

    // 确保 NavBar2 不会导致横向滚动
    :deep(.navbar2) {
        max-width: 100vw;
        overflow-x: hidden;

        .navbar-container {
            max-width: 100vw;
        }

        .nav-section {
            max-width: 100%;
        }
    }
}

/* 分类滚动区 */
.sports-categories {
    width: 100%;
    max-width: 100vw;
    box-sizing: border-box;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    padding: 16px 10px;
    gap: 28px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;

    &::-webkit-scrollbar {
        display: none;
    }

    .category-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        min-width: auto;

        .category-icon-wrapper {
            position: relative;
        }

        .category-icon {
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-dark-gray); // 默认图标颜色
            transition: all 0.3s;

            &.worldcup {
                color: #f68b24;
            }

            &.nba {
                color: #1e88e5;
            }
        }

        .category-badge {
            position: absolute;
            top: -10px;
            right: -15px;
            background: #ca4064;
            font-size: 11px;
            padding: 0 5px;
            border-radius: 20px;
            border: 2px solid var(--border-color);
            min-width: 14px;
        }

        .category-label {
            font-size: 12px;
            color: var(--text-dark-gray);
            margin-top: 8px;
        }

        &.active {
            .category-icon {
                // background: var(--bg-opposite);
                transform: scale(1.05);
            }

            .category-label {
                color: var(--bg-opposite);
                font-weight: bold;
            }
        }
    }
}

/* NBA 标题行 */
.nba-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    width: 100%;
    box-sizing: border-box;

    .title-left {
        display: flex;
        align-items: baseline;
        gap: 10px;

        .icon-circle.blue {
            color: #1e88e5;
        }

        .icon-circle.orange {
            color: #f68b24;
        }

        span {
            font-family: Noto Sans SC, Noto Sans SC;
            font-weight: 900;
            font-size: 24px;
            color: var(--bg-opposite);
        }
    }

    .day-pill {
        background: var(--bg-page);
        border: 1px solid var(--border-color);
        padding: 6px 14px;
        border-radius: 20px;
        color: var(--text-dark-gray);
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;

        .el-icon {
            color: var(--text-dark-gray);
        }
    }
}

/* Tab 切换 */
.type-tabs {
    padding: 15px 0;
    display: flex;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;

    .tab-btn {
        padding: 8px 28px;
        border-radius: 8px;
        border: none;
        background: var(--bg-page-h5);
        color: var(--text-dark-gray);
        font-weight: bold;
        border: 1px solid var(--border-color);

        &.active {
            background: var(--bg-opposite);
            color: var(--bg-page-h5);
        }
    }
}

.main-body {
    width: 100%;
    max-width: 100vw;
    padding: 0 10px;
    box-sizing: border-box;
    overflow-x: hidden;
    position: relative;
}

/* 列表卡片 */
.event-list {
    padding-bottom: 40px;
    width: 100%;
    box-sizing: border-box;

    .date-label {
        font-size: 19px;
        font-weight: bold;
        padding: 15px 0 10px;
    }

    .event-card {
        border-bottom: 1px solid var(--border-color);
        padding: 10px 0 25px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: opacity 0.2s;

        &:active {
            opacity: 0.7;
        }

        .card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            width: 100%;
            box-sizing: border-box;

            .time-tag {
                background: var(--bg-page);
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
                margin-right: 10px;
            }

            .vol-text {
                color: var(--text-dark-gray);
                font-size: 14px;
            }

            .view-btn {
                background: var(--bg-page);
                padding: 4px 10px;
                border-radius: 6px;
                color: var(--bg-opposite);
                font-size: 13px;
                border: none;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                line-height: 1;

                &:active {
                    opacity: 0.8;
                }
            }
        }

        .teams-box {
            margin-bottom: 22px;

            .team-line {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                width: 100%;
                box-sizing: border-box;
                overflow: hidden;

                .logo-img {
                    width: 26px;
                    height: 26px;
                    border-radius: 4px;
                    margin-right: 12px;
                }

                .name {
                    font-size: 17px;
                    font-weight: bold;
                    margin-right: 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex-shrink: 0;
                }

                .record {
                    color: var(--text-dark-gray);
                    font-size: 14px;
                }
            }
        }

        .bet-row {
            display: flex;
            gap: 12px;
            width: 100%;
            box-sizing: border-box;

            .odds-btn {
                flex: 1;
                height: 54px;
                border-radius: 12px;
                border: none;
                color: var(--text-opposite);
                font-size: 18px;
                font-weight: bold;
                transition: transform 0.1s;
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;

                // 3D立体效果 - 底部实色边缘条带（在按钮内部）
                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 8px;
                    border-radius: 0 0 12px 12px;
                }

                &:active {
                    transform: translateY(2px);

                    &::after {
                        height: 6px;
                    }
                }

                &.knicks {
                    background: #f68b24;

                    &::after {
                        background: #c96f1a; // 较暗的棕橙色边缘
                    }
                }

                &.lakers {
                    background: #eab308;

                    &::after {
                        background: #c99a06; // 较暗的棕金色边缘
                    }
                }

                // 世界杯按钮样式
                &.team-a {
                    background: #2563eb;

                    &::after {
                        background: #1d4ed8;
                    }
                }

                &.team-b {
                    background: #dc2626;

                    &::after {
                        background: #b91c1c;
                    }
                }
            }
        }
    }
}

// 世界杯列表样式
.worldcup-list {
    .worldcup-teams {
        .team-line {
            display: flex;
            align-items: center;
            margin-bottom: 10px;

            .logo-img {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                margin-right: 10px;
                object-fit: cover;
            }

            .short-name {
                font-size: 14px;
                font-weight: 500;
                color: var(--text-dark-gray);
                margin-right: 4px;
            }

            .full-name {
                font-size: 17px;
                font-weight: bold;
                color: var(--bg-opposite);
                margin-right: 10px;
            }

            .record {
                font-size: 14px;
                color: var(--text-dark-gray);
            }
        }
    }

    .bet-row.three-btns {
        display: flex;
        gap: 10px;

        .odds-btn {
            flex: 1;
            height: 48px;
            border-radius: 10px;
            border: none;
            font-size: 16px;
            font-weight: bold;
            transition: transform 0.1s;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 6px;
                border-radius: 0 0 10px 10px;
            }

            &:active {
                transform: translateY(2px);

                &::after {
                    height: 4px;
                }
            }

            &.btn-yellow {
                background: #eab308;

                &::after {
                    background: #ca9a06;
                }
            }

            &.btn-gray {
                background: var(--text-dark-gray);

                &::after {
                    background: #666;
                }
            }

            &.btn-pink {
                background: #db2777;

                &::after {
                    background: #be185d;
                }
            }
        }
    }
}

// 球员盘列表样式
.player-panel-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 40px;

    .player-card {
        background: var(--bg-page-h5);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        overflow: hidden;

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;

            .card-avatar {
                width: 48px;
                height: 48px;
                border-radius: 10px;
                object-fit: cover;
            }

            .card-title {
                font-size: 15px;
                font-weight: 600;
                color: var(--bg-opposite);
                flex: 1;
            }
        }

        .card-leverage {
            display: flex;
            justify-content: space-between;
            padding: 0 16px 12px;

            .leverage-item {
                display: flex;
                align-items: center;
                gap: 4px;

                .label {
                    font-size: 12px;
                    color: var(--text-dark-gray);
                }

                .value {
                    font-size: 12px;
                    color: var(--bg-opposite);
                    font-weight: 600;
                }
            }
        }

        .card-options {
            padding: 0 16px 16px;

            .option-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;

                &:last-child {
                    margin-bottom: 0;
                }

                .option-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex: 1;

                    .option-name {
                        font-size: 14px;
                        color: var(--bg-opposite);
                        min-width: 120px;
                    }

                    .option-percent {
                        font-size: 14px;
                        color: var(--text-dark-gray);
                    }
                }

                .option-btns {
                    display: flex;
                    gap: 8px;

                    .opt-btn {
                        width: 70px;
                        height: 36px;
                        border-radius: 8px;
                        border: none;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;

                        &.yes {
                            background: rgba(47, 188, 135, 0.2);
                            color: #2FBC87;

                            &:active {
                                background: rgba(47, 188, 135, 0.4);
                            }
                        }

                        &.no {
                            background: rgba(155, 89, 118, 0.3);
                            color: #db2777;

                            &:active {
                                background: rgba(155, 89, 118, 0.5);
                            }
                        }
                    }
                }
            }
        }

        .card-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--bg-page);
            border-radius: 0 0 16px 16px;

            .footer-left {
                display: flex;
                align-items: center;
                gap: 16px;

                .time-info,
                .participant-info,
                .voi-info {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    color: var(--text-dark-gray);
                }

                .time-icon,
                .user-icon {
                    width: 12px;
                    height: 12px;
                    color: var(--text-dark-gray);
                }
            }

            .bookmark-icon {
                width: 16px;
                height: 20px;
                color: var(--text-dark-gray);
                cursor: pointer;
                transition: color 0.2s;

                &:hover {
                    color: var(--bg-opposite);
                }
            }
        }
    }
}

.list-loading,
.list-empty {
    text-align: center;
    padding: 40px 0;
    color: var(--text-dark-gray);
    font-size: 14px;
}

.ml-1 {
    margin-left: 4px;
}
</style>