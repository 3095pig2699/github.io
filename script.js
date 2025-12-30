// 队伍数据存储
let teams = [];
let memberPool = []; // 公共成员池
let matches = []; // 比赛记录
let currentEditIndex = -1;
let currentEditTeamId = null;
let currentMemberSource = 'pool'; // 'pool' 或 'team'
let currentMemberTeamId = null;
let draggedElement = null;
let currentMatchMode = 'individual'; // 'individual', 'team'
let currentMatchInProgress = null; // 当前进行中的比赛
let selectedTeam1 = null;
let selectedTeam2 = null;
let individualParticipants = []; // 个人赛参赛者列表
let selectedIndividualMembers = []; // 手动匹配时选中的成员

// DOM元素
const teamsContainer = document.getElementById('teamsContainer');
const poolMembers = document.getElementById('poolMembers');
const poolMemberCount = document.getElementById('poolMemberCount');
const addTeamBtn = document.getElementById('addTeamBtn');
const addMemberToPoolBtn = document.getElementById('addMemberToPoolBtn');
const memberModal = document.getElementById('memberModal');
const teamModal = document.getElementById('teamModal');
const matchModal = document.getElementById('matchModal');
const matchResultModal = document.getElementById('matchResultModal');
const scheduleModal = document.getElementById('scheduleModal');
const statsModal = document.getElementById('statsModal');
const closeModal = document.getElementById('closeModal');
const closeTeamModal = document.getElementById('closeTeamModal');
const closeMatchModal = document.getElementById('closeMatchModal');
const closeResultModal = document.getElementById('closeResultModal');
const closeScheduleModal = document.getElementById('closeScheduleModal');
const closeStatsModal = document.getElementById('closeStatsModal');
const editMatchModal = document.getElementById('editMatchModal');
const closeEditMatchModal = document.getElementById('closeEditMatchModal');
const cancelEditMatchBtn = document.getElementById('cancelEditMatchBtn');
const saveEditMatchBtn = document.getElementById('saveEditMatchBtn');
const editMatchForm = document.getElementById('editMatchForm');
const individualSection = document.getElementById('individualSection');
const individualMembers = document.getElementById('individualMembers');
const individualCount = document.getElementById('individualCount');
const clearIndividualBtn = document.getElementById('clearIndividualBtn');
const generateBracketBtn = document.getElementById('generateBracketBtn');
const memberPoolSection = document.getElementById('memberPoolSection');
const cancelBtn = document.getElementById('cancelBtn');
const cancelTeamBtn = document.getElementById('cancelTeamBtn');
const cancelMatchBtn = document.getElementById('cancelMatchBtn');
const memberForm = document.getElementById('memberForm');
const teamForm = document.getElementById('teamForm');
const modalTitle = document.getElementById('modalTitle');
const teamModalTitle = document.getElementById('teamModalTitle');
const quickMatchBtn = document.getElementById('quickMatchBtn');
const manualMatchBtn = document.getElementById('manualMatchBtn');
const viewScheduleBtn = document.getElementById('viewScheduleBtn');
const statsBtn = document.getElementById('statsBtn');
const startMatchBtn = document.getElementById('startMatchBtn');
const confirmResultBtn = document.getElementById('confirmResultBtn');
const rankingPreview = document.getElementById('rankingPreview');
const matchInProgressModal = document.getElementById('matchInProgressModal');
const closeProgressModal = document.getElementById('closeProgressModal');
const cancelProgressBtn = document.getElementById('cancelProgressBtn');
const enterScoreBtn = document.getElementById('enterScoreBtn');
const matchProgressInfo = document.getElementById('matchProgressInfo');
const tournamentBracketModal = document.getElementById('tournamentBracketModal');
const closeBracketModal = document.getElementById('closeBracketModal');
const tournamentBracketTitle = document.getElementById('tournamentBracketTitle');
const bracketContent = document.getElementById('bracketContent');
const individualMatchModal = document.getElementById('individualMatchModal');
const closeIndividualMatchModal = document.getElementById('closeIndividualMatchModal');
const cancelIndividualMatchBtn = document.getElementById('cancelIndividualMatchBtn');
const confirmIndividualMatchBtn = document.getElementById('confirmIndividualMatchBtn');
const poolSelectList = document.getElementById('poolSelectList');
const teamSelectList = document.getElementById('teamSelectList');
const selectedIndividualList = document.getElementById('selectedIndividualList');
const selectedIndividualCount = document.getElementById('selectedIndividualCount');

// 初始化
function Init() {
    LoadDataFromStorage();
    RenderMemberPool();
    RenderAllTeams();
    RenderRankingPreview();
    RenderIndividualParticipants();
    UpdateModeDisplay();
    BindEvents();
}

// 从本地存储加载数据
function LoadDataFromStorage() {
    const savedTeams = localStorage.getItem('sf6Teams');
    const savedMemberPool = localStorage.getItem('sf6MemberPool');
    const savedMatches = localStorage.getItem('sf6Matches');
    const savedIndividualParticipants = localStorage.getItem('sf6IndividualParticipants');
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
    }
    if (savedMemberPool) {
        memberPool = JSON.parse(savedMemberPool);
    }
    if (savedMatches) {
        matches = JSON.parse(savedMatches);
    }
    if (savedIndividualParticipants) {
        individualParticipants = JSON.parse(savedIndividualParticipants);
    }
}

// 保存数据到本地存储
function SaveDataToStorage() {
    localStorage.setItem('sf6Teams', JSON.stringify(teams));
    localStorage.setItem('sf6MemberPool', JSON.stringify(memberPool));
    localStorage.setItem('sf6Matches', JSON.stringify(matches));
    localStorage.setItem('sf6IndividualParticipants', JSON.stringify(individualParticipants));
}

// 生成唯一ID
function GenerateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 渲染公共成员池
function RenderMemberPool() {
    poolMembers.innerHTML = '';
    poolMemberCount.textContent = `(${memberPool.length})`;
    
    if (memberPool.length === 0) {
        poolMembers.innerHTML = '<div class="empty-pool">公共池暂无成员，点击"添加成员到公共池"按钮添加</div>';
        return;
    }
    
    memberPool.forEach((member, index) => {
        const memberCard = CreatePoolMemberCard(member, index);
        poolMembers.appendChild(memberCard);
    });
    
    // 绑定公共池拖拽接收事件
    BindPoolDropEvents();
}

// 创建公共池成员卡片
function CreatePoolMemberCard(member, index) {
    const card = document.createElement('div');
    card.className = 'member-card pool-member';
    card.draggable = true;
    card.dataset.index = index;
    card.dataset.source = 'pool';

    card.addEventListener('dragstart', HandleDragStart);
    card.addEventListener('dragend', HandleDragEnd);

    card.innerHTML = `
        <div class="member-header">
            <div class="member-name">${member.name}</div>
            <div class="member-actions">
                <button class="btn-icon" onclick="EditPoolMember(${index})" title="编辑">✏️</button>
                <button class="btn-icon" onclick="DeletePoolMember(${index})" title="删除">🗑️</button>
            </div>
        </div>
        <div class="member-info">
            <div class="member-info-item">
                <span class="member-info-label">角色：</span>
                <span>${member.character}</span>
            </div>
            <div class="member-info-item">
                <span class="member-info-label">段位：</span>
                <span>${member.rank}</span>
            </div>
        </div>
        ${member.note ? `<div class="member-note">备注：${member.note}</div>` : ''}
    `;

    return card;
}

    // 绑定公共池拖拽接收事件
function BindPoolDropEvents() {
    poolMembers.addEventListener('dragover', (e) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        poolMembers.classList.add('drag-over');
        
        // 触发自动滚动检查
        HandleDragOverForScroll(e);
        
        return false;
    });
    
    poolMembers.addEventListener('dragleave', () => {
        poolMembers.classList.remove('drag-over');
    });
    
    poolMembers.addEventListener('drop', (e) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
        
        if (draggedElement) {
            const source = draggedElement.dataset.source;
            const teamId = draggedElement.dataset.teamId;
            const index = parseInt(draggedElement.dataset.index);
            
            if (source === 'team' && teamId) {
                // 从队伍移回公共池（包括队长）
                MoveMemberFromTeamToPool(teamId, index);
            }
        }
        
        poolMembers.classList.remove('drag-over');
        return false;
    });
}

// 渲染所有队伍
function RenderAllTeams() {
    teamsContainer.innerHTML = '';
    
    if (teams.length === 0) {
        teamsContainer.innerHTML = '<div class="empty-teams">暂无队伍，请点击右上角"创建新队伍"按钮添加队伍</div>';
        return;
    }
    
    teams.forEach(team => {
        const teamCard = CreateTeamCard(team);
        teamsContainer.appendChild(teamCard);
    });
}

// 创建队伍卡片
function CreateTeamCard(team) {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.dataset.teamId = team.id;
    
    const memberCount = team.members ? team.members.length : 0;
    const captain = team.members ? team.members.find(m => m.isCaptain) : null;
    const points = GetTeamPoints(team.id);
    
    card.innerHTML = `
        <div class="team-header">
            <div>
                <div class="team-name">${team.name}</div>
                <div style="font-size: 0.9em; color: #ffd700; font-weight: bold; margin-top: 5px;">
                    🏆 积分: ${points}
                </div>
            </div>
            <div class="team-actions">
                <button class="btn-edit-team" onclick="EditTeam('${team.id}')" title="编辑队伍">✏️</button>
                <button class="btn-delete-team" onclick="DeleteTeam('${team.id}')" title="删除队伍">🗑️</button>
            </div>
        </div>
        <div class="captain-section">
            <h3>队长信息</h3>
            <div class="captain-card" data-team-id="${team.id}">
                ${captain ? '' : '<div class="empty-captain"><p>拖拽成员到此处设为队长</p></div>'}
            </div>
        </div>
        <div class="members-section">
            <h3>成员列表 <span style="font-size: 0.8em; color: #999; font-weight: normal;">(${memberCount})</span></h3>
            <div class="members-list" data-team-id="${team.id}">
            </div>
            <button class="add-member-btn" onclick="AddMember('${team.id}')">+ 添加成员</button>
        </div>
    `;
    
    // 渲染队长
    const captainCard = card.querySelector('.captain-card');
    if (captain) {
        const captainElement = CreateMemberCard(captain, team.members.indexOf(captain), team.id, true);
        captainCard.innerHTML = '';
        captainCard.appendChild(captainElement);
    }
    
    // 渲染成员列表
    const membersList = card.querySelector('.members-list');
    if (team.members && team.members.length > 0) {
        team.members.forEach((member, index) => {
            if (!member.isCaptain) {
                const memberCard = CreateMemberCard(member, index, team.id, false);
                membersList.appendChild(memberCard);
            }
        });
    }
    
    // 绑定拖拽事件
    BindTeamDragEvents(card, team.id);
    
    return card;
}

// 创建成员卡片
function CreateMemberCard(member, index, teamId, isCaptain = false) {
    const card = document.createElement('div');
    card.className = `member-card ${isCaptain ? 'captain' : ''}`;
    card.draggable = true; // 队长也可以拖拽
    card.dataset.index = index;
    card.dataset.teamId = teamId;
    card.dataset.source = 'team';
    card.dataset.isCaptain = isCaptain ? 'true' : 'false';

    // 所有成员（包括队长）都可以拖拽
    card.addEventListener('dragstart', HandleDragStart);
    card.addEventListener('dragend', HandleDragEnd);

    card.innerHTML = `
        <div class="member-header">
            <div class="member-name">${member.name}</div>
            <div class="member-actions">
                ${!isCaptain ? `<button class="btn-icon" onclick="SetAsCaptain('${teamId}', ${index})" title="设为队长">👑</button>` : ''}
                <button class="btn-icon" onclick="EditMember('${teamId}', ${index})" title="编辑">✏️</button>
                <button class="btn-icon" onclick="DeleteMember('${teamId}', ${index})" title="删除">🗑️</button>
            </div>
        </div>
        <div class="member-info">
            <div class="member-info-item">
                <span class="member-info-label">角色：</span>
                <span>${member.character}</span>
            </div>
            <div class="member-info-item">
                <span class="member-info-label">段位：</span>
                <span>${member.rank}</span>
            </div>
        </div>
        ${member.note ? `<div class="member-note">备注：${member.note}</div>` : ''}
    `;

    return card;
}

// 绑定队伍拖拽事件
function BindTeamDragEvents(teamCard, teamId) {
    const captainCard = teamCard.querySelector('.captain-card');
    const membersList = teamCard.querySelector('.members-list');
    
    // 队长区域拖拽
    captainCard.addEventListener('dragover', (e) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        captainCard.classList.add('drag-over');
        
        // 触发自动滚动检查
        HandleDragOverForScroll(e);
        
        return false;
    });
    
    captainCard.addEventListener('dragleave', () => {
        captainCard.classList.remove('drag-over');
    });
    
    captainCard.addEventListener('drop', (e) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
        
        if (draggedElement) {
            const source = draggedElement.dataset.source;
            const draggedTeamId = draggedElement.dataset.teamId;
            const index = parseInt(draggedElement.dataset.index);
            const isCaptain = draggedElement.dataset.isCaptain === 'true';
            
            // 如果拖拽的是当前队伍的队长，不做任何操作（避免自己替换自己）
            if (source === 'team' && draggedTeamId === teamId && isCaptain) {
                captainCard.classList.remove('drag-over');
                return false;
            }
            
            if (source === 'pool') {
                // 从公共池拖到队长位置
                MoveMemberFromPoolToTeamAsCaptain(index, teamId);
            } else if (source === 'team' && draggedTeamId === teamId) {
                // 同一队伍内设为队长
                SetAsCaptain(teamId, index);
            } else if (source === 'team' && draggedTeamId !== teamId) {
                // 从其他队伍拖到当前队伍队长位置
                MoveMemberFromTeamToTeamAsCaptain(draggedTeamId, index, teamId);
            }
        }
        
        captainCard.classList.remove('drag-over');
        return false;
    });
    
    // 成员列表区域拖拽
    membersList.addEventListener('dragover', (e) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        membersList.classList.add('drag-over');
        
        // 触发自动滚动检查
        HandleDragOverForScroll(e);
        
        return false;
    });
    
    membersList.addEventListener('dragleave', () => {
        membersList.classList.remove('drag-over');
    });
    
    membersList.addEventListener('drop', (e) => {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
        
        if (draggedElement) {
            const source = draggedElement.dataset.source;
            const draggedTeamId = draggedElement.dataset.teamId;
            const index = parseInt(draggedElement.dataset.index);
            const isCaptain = draggedElement.dataset.isCaptain === 'true';
            
            // 如果拖拽的是当前队伍的队长到成员列表，取消队长身份
            if (source === 'team' && draggedTeamId === teamId && isCaptain) {
                RemoveCaptainStatus(teamId, index);
                membersList.classList.remove('drag-over');
                return false;
            }
            
            if (source === 'pool') {
                // 从公共池拖到成员列表
                MoveMemberFromPoolToTeam(index, teamId);
            } else if (source === 'team' && draggedTeamId !== teamId) {
                // 从其他队伍拖到当前队伍
                MoveMemberFromTeamToTeam(draggedTeamId, index, teamId);
            }
        }
        
        membersList.classList.remove('drag-over');
        return false;
    });
}

// 从公共池移动到队伍（作为普通成员）
function MoveMemberFromPoolToTeam(poolIndex, teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    const member = memberPool[poolIndex];
    if (!member) return;
    
    if (!team.members) {
        team.members = [];
    }
    
    memberPool.splice(poolIndex, 1);
    team.members.push({ ...member, isCaptain: false });
    
    SaveDataToStorage();
    RenderMemberPool();
    RenderAllTeams();
}

// 从公共池移动到队伍（作为队长）
function MoveMemberFromPoolToTeamAsCaptain(poolIndex, teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    const member = memberPool[poolIndex];
    if (!member) return;
    
    if (!team.members) {
        team.members = [];
    }
    
    // 清除之前的队长
    team.members.forEach(m => {
        if (m.isCaptain) {
            m.isCaptain = false;
        }
    });
    
    memberPool.splice(poolIndex, 1);
    team.members.push({ ...member, isCaptain: true });
    
    SaveDataToStorage();
    RenderMemberPool();
    RenderAllTeams();
}

// 从队伍移动到公共池
function MoveMemberFromTeamToPool(teamId, index) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.members) return;
    
    const member = team.members[index];
    if (!member) return;
    
    // 如果是队长，先清除队长状态
    if (member.isCaptain) {
        member.isCaptain = false;
    }
    
    team.members.splice(index, 1);
    memberPool.push({ ...member, isCaptain: false });
    
    SaveDataToStorage();
    RenderMemberPool();
    RenderAllTeams();
}

// 移除队长身份（将队长移到成员列表）
function RemoveCaptainStatus(teamId, index) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.members) return;
    
    const member = team.members[index];
    if (!member || !member.isCaptain) return;
    
    // 清除队长状态
    member.isCaptain = false;
    
    SaveDataToStorage();
    RenderAllTeams();
}

// 从队伍移动到其他队伍（作为普通成员）
function MoveMemberFromTeamToTeam(fromTeamId, index, toTeamId) {
    const fromTeam = teams.find(t => t.id === fromTeamId);
    const toTeam = teams.find(t => t.id === toTeamId);
    if (!fromTeam || !toTeam || !fromTeam.members) return;
    
    const member = fromTeam.members[index];
    if (!member) return;
    
    if (!toTeam.members) {
        toTeam.members = [];
    }
    
    // 如果是队长，先清除队长状态
    if (member.isCaptain) {
        member.isCaptain = false;
    }
    
    fromTeam.members.splice(index, 1);
    toTeam.members.push({ ...member, isCaptain: false });
    
    SaveDataToStorage();
    RenderAllTeams();
}

// 从队伍移动到其他队伍（作为队长）
function MoveMemberFromTeamToTeamAsCaptain(fromTeamId, index, toTeamId) {
    const fromTeam = teams.find(t => t.id === fromTeamId);
    const toTeam = teams.find(t => t.id === toTeamId);
    if (!fromTeam || !toTeam || !fromTeam.members) return;
    
    const member = fromTeam.members[index];
    if (!member) return;
    
    if (!toTeam.members) {
        toTeam.members = [];
    }
    
    // 清除目标队伍的队长
    toTeam.members.forEach(m => {
        if (m.isCaptain) {
            m.isCaptain = false;
        }
    });
    
    // 如果是原队伍的队长，清除队长状态
    if (member.isCaptain) {
        member.isCaptain = false;
    }
    
    fromTeam.members.splice(index, 1);
    toTeam.members.push({ ...member, isCaptain: true });
    
    SaveDataToStorage();
    RenderAllTeams();
}

// 绑定事件
function BindEvents() {
    addTeamBtn.addEventListener('click', () => {
        currentEditTeamId = null;
        teamModalTitle.textContent = '创建队伍';
        teamForm.reset();
        ShowTeamModal();
    });

    addMemberToPoolBtn.addEventListener('click', () => {
        currentMemberSource = 'pool';
        currentEditIndex = -1;
        modalTitle.textContent = '添加成员到公共池';
        document.getElementById('memberTeamId').value = '';
        document.getElementById('memberSource').value = 'pool';
        memberForm.reset();
        ShowModal();
    });

    closeModal.addEventListener('click', HideModal);
    cancelBtn.addEventListener('click', HideModal);
    closeTeamModal.addEventListener('click', HideTeamModal);
    cancelTeamBtn.addEventListener('click', HideTeamModal);

    memberForm.addEventListener('submit', HandleMemberFormSubmit);
    teamForm.addEventListener('submit', HandleTeamFormSubmit);

    // 点击弹窗外部关闭
    memberModal.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            HideModal();
        }
    });

    teamModal.addEventListener('click', (e) => {
        if (e.target === teamModal) {
            HideTeamModal();
        }
    });

    // 比赛相关事件
    quickMatchBtn.addEventListener('click', () => {
        if (currentMatchMode === 'individual') {
            QuickMatchIndividual();
        } else {
            QuickMatch();
        }
    });
    manualMatchBtn.addEventListener('click', () => {
        if (currentMatchMode === 'individual') {
            ShowIndividualMatch();
        } else {
            ShowManualMatch();
        }
    });
    viewScheduleBtn.addEventListener('click', ShowSchedule);
    statsBtn.addEventListener('click', ShowStats);
    startMatchBtn.addEventListener('click', StartMatch);
    confirmResultBtn.addEventListener('click', ConfirmMatchResult);
    
    
    closeMatchModal.addEventListener('click', HideMatchModal);
    closeResultModal.addEventListener('click', HideMatchResultModal);
    closeScheduleModal.addEventListener('click', HideScheduleModal);
    closeStatsModal.addEventListener('click', HideStatsModal);
    closeEditMatchModal.addEventListener('click', HideEditMatchModal);
    cancelEditMatchBtn.addEventListener('click', HideEditMatchModal);
    saveEditMatchBtn.addEventListener('click', SaveEditMatch);
    cancelMatchBtn.addEventListener('click', HideMatchModal);
    closeProgressModal.addEventListener('click', HideMatchInProgress);
    cancelProgressBtn.addEventListener('click', CancelMatch);
    enterScoreBtn.addEventListener('click', EnterMatchScore);

    // 比赛模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentMatchMode = e.target.dataset.mode;
            
            // 根据模式显示/隐藏相应区域
            UpdateModeDisplay();
        });
    });
    
    // 个人赛相关事件
    clearIndividualBtn.addEventListener('click', ClearIndividualParticipants);
    generateBracketBtn.addEventListener('click', GenerateIndividualBracket);
    
    // 个人赛手动匹配事件
    closeIndividualMatchModal.addEventListener('click', HideIndividualMatchModal);
    cancelIndividualMatchBtn.addEventListener('click', HideIndividualMatchModal);
    confirmIndividualMatchBtn.addEventListener('click', ConfirmIndividualMatch);
    
    // 锦标赛标签切换事件
    if (tournamentBracketModal) {
        tournamentBracketModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                document.querySelectorAll('.tournament-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                const stage = e.target.dataset.stage;
                let tournaments = [];
                const savedTournaments = localStorage.getItem('sf6Tournaments');
                if (savedTournaments) {
                    tournaments = JSON.parse(savedTournaments);
                }
                // 获取当前显示的锦标赛
                const tournamentName = tournamentBracketTitle.textContent;
                const tournament = tournaments.find(t => t.name === tournamentName);
                if (tournament) {
                    RenderTournamentBracket(tournament, stage);
                }
            }
        });
    }
    
    if (closeBracketModal) {
        closeBracketModal.addEventListener('click', HideTournamentBracket);
    }

    // 移除旧的点击选择队伍逻辑，现在使用弹窗内的选择列表
}

// 显示弹窗
function ShowModal() {
    memberModal.classList.add('show');
}

// 隐藏弹窗
function HideModal() {
    memberModal.classList.remove('show');
}

// 显示队伍弹窗
function ShowTeamModal() {
    teamModal.classList.add('show');
}

// 隐藏队伍弹窗
function HideTeamModal() {
    teamModal.classList.remove('show');
}

// 添加成员
function AddMember(teamId) {
    currentMemberSource = 'team';
    currentMemberTeamId = teamId;
    currentEditIndex = -1;
    modalTitle.textContent = '添加成员';
    document.getElementById('memberTeamId').value = teamId;
    document.getElementById('memberSource').value = 'team';
    memberForm.reset();
    ShowModal();
}

// 处理成员表单提交
function HandleMemberFormSubmit(e) {
    e.preventDefault();
    
    const memberSource = document.getElementById('memberSource').value;
    const teamId = document.getElementById('memberTeamId').value;
    
    const memberData = {
        name: document.getElementById('memberName').value.trim(),
        character: document.getElementById('memberCharacter').value.trim(),
        rank: document.getElementById('memberRank').value,
        note: document.getElementById('memberNote').value.trim(),
        isCaptain: false
    };

    if (memberSource === 'pool') {
        // 添加到公共池
        if (currentEditIndex === -1) {
            memberPool.push(memberData);
        } else {
            memberPool[currentEditIndex] = memberData;
        }
    } else {
        // 添加到队伍
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        if (!team.members) {
            team.members = [];
        }

        if (currentEditIndex === -1) {
            team.members.push(memberData);
        } else {
            const wasCaptain = team.members[currentEditIndex].isCaptain;
            memberData.isCaptain = wasCaptain;
            team.members[currentEditIndex] = memberData;
        }
    }

    SaveDataToStorage();
    RenderMemberPool();
    RenderAllTeams();
    RenderRankingPreview();
    HideModal();
}

// 处理队伍表单提交
function HandleTeamFormSubmit(e) {
    e.preventDefault();

    const teamName = document.getElementById('teamName').value.trim();
    if (!teamName) {
        alert('请输入队伍名称');
        return;
    }

    if (currentEditTeamId) {
        // 编辑现有队伍
        const team = teams.find(t => t.id === currentEditTeamId);
        if (team) {
            team.name = teamName;
        }
    } else {
        // 创建新队伍
        const newTeam = {
            id: GenerateId(),
            name: teamName,
            members: []
        };
        teams.push(newTeam);
    }

    SaveDataToStorage();
    RenderAllTeams();
    RenderRankingPreview();
    HideTeamModal();
}

// 编辑队伍
function EditTeam(teamId) {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    
    currentEditTeamId = teamId;
    teamModalTitle.textContent = '编辑队伍';
    document.getElementById('teamName').value = team.name;
    ShowTeamModal();
}

// 删除队伍
function DeleteTeam(teamId) {
    if (confirm('确定要删除这个队伍吗？此操作不可恢复！')) {
        const index = teams.findIndex(t => t.id === teamId);
        if (index !== -1) {
            teams.splice(index, 1);
            SaveDataToStorage();
            RenderAllTeams();
        }
    }
}

// 编辑公共池成员
function EditPoolMember(index) {
    currentMemberSource = 'pool';
    currentEditIndex = index;
    const member = memberPool[index];
    modalTitle.textContent = '编辑成员';
    document.getElementById('memberTeamId').value = '';
    document.getElementById('memberSource').value = 'pool';
    
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberCharacter').value = member.character;
    document.getElementById('memberRank').value = member.rank;
    document.getElementById('memberNote').value = member.note || '';
    
    ShowModal();
}

// 删除公共池成员
function DeletePoolMember(index) {
    if (confirm('确定要删除这名成员吗？')) {
        memberPool.splice(index, 1);
        SaveDataToStorage();
        RenderMemberPool();
    }
}

// 编辑成员
function EditMember(teamId, index) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.members) return;

    currentMemberSource = 'team';
    currentMemberTeamId = teamId;
    currentEditIndex = index;
    const member = team.members[index];
    modalTitle.textContent = '编辑成员';
    document.getElementById('memberTeamId').value = teamId;
    document.getElementById('memberSource').value = 'team';
    
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberCharacter').value = member.character;
    document.getElementById('memberRank').value = member.rank;
    document.getElementById('memberNote').value = member.note || '';
    
    ShowModal();
}

// 删除成员
function DeleteMember(teamId, index) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.members) return;

    if (confirm('确定要删除这名成员吗？')) {
        team.members.splice(index, 1);
        SaveDataToStorage();
        RenderAllTeams();
    }
}

// 设为队长
function SetAsCaptain(teamId, index) {
    const team = teams.find(t => t.id === teamId);
    if (!team || !team.members) return;

    // 清除之前的队长
    team.members.forEach(m => {
        if (m.isCaptain) {
            m.isCaptain = false;
        }
    });
    
    // 设置新队长
    team.members[index].isCaptain = true;
    
    SaveDataToStorage();
    RenderAllTeams();
}

// 拖拽开始
function HandleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    // 启动自动滚动监听
    StartAutoScroll();
}

// 拖拽结束
function HandleDragEnd(e) {
    this.classList.remove('dragging');
    // 清除所有拖拽悬停状态
    document.querySelectorAll('.captain-card, .members-list, .pool-members').forEach(card => {
        card.classList.remove('drag-over');
    });
    
    // 停止自动滚动
    StopAutoScroll();
}

// 自动滚动相关变量
let autoScrollInterval = null;
let autoScrollSpeed = 0;

// 启动自动滚动
function StartAutoScroll() {
    if (autoScrollInterval) return;
    
    autoScrollInterval = setInterval(() => {
        if (autoScrollSpeed !== 0) {
            window.scrollBy(0, autoScrollSpeed);
        }
    }, 16); // 约60fps
    
    // 监听鼠标移动，计算滚动速度
    document.addEventListener('dragover', HandleDragOverForScroll);
}

// 停止自动滚动
function StopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
    autoScrollSpeed = 0;
    document.removeEventListener('dragover', HandleDragOverForScroll);
}

// 处理拖拽时的自动滚动
function HandleDragOverForScroll(e) {
    const scrollThreshold = 100; // 距离边缘多少像素时开始滚动
    const maxScrollSpeed = 15; // 最大滚动速度
    const viewportHeight = window.innerHeight;
    const mouseY = e.clientY;
    
    // 计算距离顶部和底部的距离
    const distanceFromTop = mouseY;
    const distanceFromBottom = viewportHeight - mouseY;
    
    // 如果接近顶部，向上滚动
    if (distanceFromTop < scrollThreshold) {
        const speed = (scrollThreshold - distanceFromTop) / scrollThreshold * maxScrollSpeed;
        autoScrollSpeed = -speed;
    }
    // 如果接近底部，向下滚动
    else if (distanceFromBottom < scrollThreshold) {
        const speed = (scrollThreshold - distanceFromBottom) / scrollThreshold * maxScrollSpeed;
        autoScrollSpeed = speed;
    }
    // 否则不滚动
    else {
        autoScrollSpeed = 0;
    }
}

// ==================== 比赛功能 ====================

// 计算队伍积分
function GetTeamPoints(teamId) {
    const teamMatches = matches.filter(m => 
        (m.team1Id === teamId || m.team2Id === teamId) && m.status === 'completed'
    );
    let points = 0;
    teamMatches.forEach(match => {
        if (match.winnerId === teamId) {
            points += 3; // 胜利+3分
        } else if (match.team1Id === teamId || match.team2Id === teamId) {
            points += 1; // 参与+1分
        }
    });
    return points;
}

// 渲染排名预览
function RenderRankingPreview() {
    if (teams.length === 0) {
        rankingPreview.innerHTML = '<p style="color: rgba(255,255,255,0.7);">暂无队伍</p>';
        return;
    }
    
    const teamsWithPoints = teams.map(team => ({
        ...team,
        points: GetTeamPoints(team.id)
    })).sort((a, b) => b.points - a.points);
    
    rankingPreview.innerHTML = '';
    teamsWithPoints.slice(0, 5).forEach((team, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span class="team-name">${team.name}</span>
            <span class="points">${team.points}分</span>
        `;
        rankingPreview.appendChild(item);
    });
}

// 快速匹配
function QuickMatch() {
    if (teams.length < 2) {
        alert('至少需要2个队伍才能进行匹配！');
        return;
    }
    
    const availableTeams = teams.filter(t => t.members && t.members.length > 0);
    if (availableTeams.length < 2) {
        alert('至少需要2个有成员的队伍才能进行匹配！');
        return;
    }
    
    // 随机选择两个队伍
    const shuffled = [...availableTeams].sort(() => 0.5 - Math.random());
    selectedTeam1 = shuffled[0].id;
    selectedTeam2 = shuffled[1].id;
    
    ShowMatchModal();
}

// 显示手动匹配
function ShowManualMatch() {
    if (teams.length < 2) {
        alert('至少需要2个队伍才能进行匹配！');
        return;
    }
    
    selectedTeam1 = null;
    selectedTeam2 = null;
    document.querySelectorAll('.team-card').forEach(card => {
        card.classList.remove('selected');
    });
    ShowMatchModal();
}

// 显示匹配弹窗
function ShowMatchModal() {
    matchModal.classList.add('show');
    RenderTeamSelectLists();
    UpdateMatchDisplay();
}

// 渲染队伍选择列表
function RenderTeamSelectLists() {
    const team1List = document.getElementById('team1SelectList');
    const team2List = document.getElementById('team2SelectList');
    
    team1List.innerHTML = '';
    team2List.innerHTML = '';
    
    teams.forEach(team => {
        if (!team.members || team.members.length === 0) return;
        
        const points = GetTeamPoints(team.id);
        
        // 队伍1选择列表
        const item1 = document.createElement('div');
        item1.className = `team-select-item ${selectedTeam1 === team.id ? 'selected' : ''} ${selectedTeam2 === team.id ? 'disabled' : ''}`;
        item1.dataset.teamId = team.id;
        item1.dataset.slot = '1';
        item1.innerHTML = `
            <div>
                <div class="team-select-item-name">${team.name}</div>
                <div class="team-select-item-info">积分: ${points} | 成员: ${team.members ? team.members.length : 0}</div>
            </div>
        `;
        item1.addEventListener('click', () => SelectTeamForMatch(team.id, 1));
        team1List.appendChild(item1);
        
        // 队伍2选择列表
        const item2 = document.createElement('div');
        item2.className = `team-select-item ${selectedTeam2 === team.id ? 'selected' : ''} ${selectedTeam1 === team.id ? 'disabled' : ''}`;
        item2.dataset.teamId = team.id;
        item2.dataset.slot = '2';
        item2.innerHTML = `
            <div>
                <div class="team-select-item-name">${team.name}</div>
                <div class="team-select-item-info">积分: ${points} | 成员: ${team.members ? team.members.length : 0}</div>
            </div>
        `;
        item2.addEventListener('click', () => SelectTeamForMatch(team.id, 2));
        team2List.appendChild(item2);
    });
}

// 选择队伍进行匹配
function SelectTeamForMatch(teamId, slot) {
    if (slot === 1) {
        if (selectedTeam2 === teamId) return; // 不能选择已选为队伍2的队伍
        selectedTeam1 = teamId;
    } else {
        if (selectedTeam1 === teamId) return; // 不能选择已选为队伍1的队伍
        selectedTeam2 = teamId;
    }
    
    RenderTeamSelectLists();
    UpdateMatchDisplay();
}

// 隐藏匹配弹窗
function HideMatchModal() {
    matchModal.classList.remove('show');
    selectedTeam1 = null;
    selectedTeam2 = null;
    document.querySelectorAll('.team-card').forEach(card => {
        card.classList.remove('selected');
    });
}

// 更新匹配显示
function UpdateMatchDisplay() {
    const team1Display = document.getElementById('team1Display');
    const team2Display = document.getElementById('team2Display');
    const prediction = document.getElementById('matchPrediction');
    
    if (selectedTeam1) {
        const team1 = teams.find(t => t.id === selectedTeam1);
        team1Display.innerHTML = `
            <h3>${team1.name}</h3>
            <p>成员数: ${team1.members ? team1.members.length : 0}</p>
            <p>积分: ${GetTeamPoints(selectedTeam1)}</p>
        `;
        team1Display.classList.add('selected');
    } else {
        team1Display.innerHTML = '<div class="team-placeholder">点击选择队伍1</div>';
        team1Display.classList.remove('selected');
    }
    
    if (selectedTeam2) {
        const team2 = teams.find(t => t.id === selectedTeam2);
        team2Display.innerHTML = `
            <h3>${team2.name}</h3>
            <p>成员数: ${team2.members ? team2.members.length : 0}</p>
            <p>积分: ${GetTeamPoints(selectedTeam2)}</p>
        `;
        team2Display.classList.add('selected');
    } else {
        team2Display.innerHTML = '<div class="team-placeholder">点击选择队伍2</div>';
        team2Display.classList.remove('selected');
    }
    
    // 显示比赛信息
    if (selectedTeam1 && selectedTeam2) {
        const team1 = teams.find(t => t.id === selectedTeam1);
        const team2 = teams.find(t => t.id === selectedTeam2);
        
        prediction.innerHTML = `
            <h4>比赛信息</h4>
            <p><strong>比赛模式:</strong> ${currentMatchMode === 'individual' ? '个人赛 (BO3)' : '团队赛'}</p>
            <p><strong>${team1.name}</strong> VS <strong>${team2.name}</strong></p>
        `;
        startMatchBtn.disabled = false;
    } else {
        prediction.innerHTML = '';
        startMatchBtn.disabled = true;
    }
}

// 开始比赛
function StartMatch() {
    if (!selectedTeam1 || !selectedTeam2) return;
    
    const team1 = teams.find(t => t.id === selectedTeam1);
    const team2 = teams.find(t => t.id === selectedTeam2);
    
    if (!team1 || !team2) return;
    
    // 创建比赛记录
    const match = {
        id: GenerateId(),
        team1Id: selectedTeam1,
        team2Id: selectedTeam2,
        team1Name: team1.name,
        team2Name: team2.name,
        mode: currentMatchMode,
        status: 'in_progress', // 改为进行中状态
        score1: 0,
        score2: 0,
        winnerId: null,
        date: new Date().toISOString()
    };
    
    matches.push(match);
    SaveDataToStorage();
    
    // 显示比赛进行中界面
    currentMatchInProgress = match;
    ShowMatchInProgress(match);
    HideMatchModal();
}

// 显示比赛进行中界面
function ShowMatchInProgress(match) {
    const team1 = teams.find(t => t.id === match.team1Id);
    const team2 = teams.find(t => t.id === match.team2Id);
    
    let matchInfo = `
        <div class="match-progress-teams">
            <div class="progress-team">
                <h3>${match.team1Name}</h3>
                ${team1 && team1.members ? `<p>成员数: ${team1.members.length}</p>` : ''}
                <p style="font-size: 1.2em; font-weight: bold; margin-top: 10px; color: #ffd700;">${match.score1}</p>
            </div>
            <div class="vs-divider-large">VS</div>
            <div class="progress-team">
                <h3>${match.team2Name}</h3>
                ${team2 && team2.members ? `<p>成员数: ${team2.members.length}</p>` : ''}
                <p style="font-size: 1.2em; font-weight: bold; margin-top: 10px; color: #ffd700;">${match.score2}</p>
            </div>
        </div>
        <div class="match-mode-info">
            <p><strong>比赛模式:</strong> ${match.mode === 'individual' ? '个人赛 (BO3)' : '团队赛'}</p>
            <p><strong>当前比分:</strong> ${match.score1} - ${match.score2}</p>
            <p><strong>比赛时间:</strong> ${new Date(match.date).toLocaleString('zh-CN')}</p>
            ${match.mode === 'individual' ? `<p style="color: #666; font-size: 0.9em;">BO3规则：先赢2局者获胜</p>` : ''}
        </div>
    `;
    
    matchProgressInfo.innerHTML = matchInfo;
    matchInProgressModal.dataset.matchId = match.id;
    matchInProgressModal.classList.add('show');
}

// 隐藏比赛进行中界面
function HideMatchInProgress() {
    matchInProgressModal.classList.remove('show');
    currentMatchInProgress = null;
}

// 取消比赛
function CancelMatch() {
    const matchId = matchInProgressModal.dataset.matchId;
    if (matchId && confirm('确定要取消这场比赛吗？')) {
        const index = matches.findIndex(m => m.id === matchId);
        if (index !== -1) {
            matches.splice(index, 1);
            SaveDataToStorage();
            RenderRankingPreview();
        }
        HideMatchInProgress();
    }
}

// 进入输入比分
function EnterMatchScore() {
    const matchId = matchInProgressModal.dataset.matchId;
    const match = matches.find(m => m.id === matchId);
    if (match) {
        HideMatchInProgress();
        ShowMatchResult(match);
    }
}

// 显示比赛结果
function ShowMatchResult(match) {
    const resultDisplay = document.getElementById('resultDisplay');
    
    // 个人赛使用BO3规则（三局两胜）
    if (match.mode === 'individual') {
        resultDisplay.innerHTML = `
            <h3>${match.team1Name} VS ${match.team2Name}</h3>
            <p style="color: #666; margin-bottom: 20px;">个人赛规则：BO3（三局两胜，先赢2局者获胜）</p>
            ${match.status === 'in_progress' && (match.score1 > 0 || match.score2 > 0) ? `
                <p style="color: #ff9800; margin-bottom: 15px; font-weight: bold;">当前比分: ${match.score1} - ${match.score2}</p>
            ` : ''}
            <div class="score-input">
                <label>${match.team1Name} 获胜局数:</label>
                <input type="number" id="score1" min="0" max="2" value="${match.score1 || 0}" style="width: 80px; padding: 8px; margin: 10px;">
                <span style="color: #999; font-size: 0.9em;">(0-2)</span>
            </div>
            <div class="score-input">
                <label>${match.team2Name} 获胜局数:</label>
                <input type="number" id="score2" min="0" max="2" value="${match.score2 || 0}" style="width: 80px; padding: 8px; margin: 10px;">
                <span style="color: #999; font-size: 0.9em;">(0-2)</span>
            </div>
            <div id="scoreValidation" style="color: #f44336; margin-top: 10px; display: none;"></div>
        `;
    } else {
        // 团队赛使用普通比分
        resultDisplay.innerHTML = `
            <h3>${match.team1Name} VS ${match.team2Name}</h3>
            <p style="color: #666; margin-bottom: 20px;">团队赛：输入最终比分</p>
            ${match.status === 'in_progress' && (match.score1 > 0 || match.score2 > 0) ? `
                <p style="color: #ff9800; margin-bottom: 15px; font-weight: bold;">当前比分: ${match.score1} - ${match.score2}</p>
            ` : ''}
            <div class="score-input">
                <label>${match.team1Name} 得分:</label>
                <input type="number" id="score1" min="0" value="${match.score1 || 0}" style="width: 80px; padding: 8px; margin: 10px;">
            </div>
            <div class="score-input">
                <label>${match.team2Name} 得分:</label>
                <input type="number" id="score2" min="0" value="${match.score2 || 0}" style="width: 80px; padding: 8px; margin: 10px;">
            </div>
        `;
    }
    
    matchResultModal.dataset.matchId = match.id;
    matchResultModal.classList.add('show');
}

// 确认比赛结果
function ConfirmMatchResult() {
    const matchType = matchResultModal.dataset.matchType;
    
    if (matchType === 'tournament') {
        ConfirmTournamentMatchResult();
    } else {
        ConfirmRegularMatchResult();
    }
}

// 确认常规比赛结果
function ConfirmRegularMatchResult() {
    const matchId = matchResultModal.dataset.matchId;
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    const score1 = parseInt(document.getElementById('score1').value) || 0;
    const score2 = parseInt(document.getElementById('score2').value) || 0;
    
    // 个人赛BO3验证
    if (match.mode === 'individual') {
        const validation = document.getElementById('scoreValidation');
        if (score1 + score2 > 3) {
            validation.textContent = '总局数不能超过3局！';
            validation.style.display = 'block';
            return;
        }
        if (score1 > 2 || score2 > 2) {
            validation.textContent = '单方获胜局数不能超过2局！';
            validation.style.display = 'block';
            return;
        }
        if (score1 === 2 && score2 >= 2) {
            validation.textContent = '一方获胜2局后比赛结束，另一方不能有2局！';
            validation.style.display = 'block';
            return;
        }
        if (score2 === 2 && score1 >= 2) {
            validation.textContent = '一方获胜2局后比赛结束，另一方不能有2局！';
            validation.style.display = 'block';
            return;
        }
        if (score1 < 2 && score2 < 2 && score1 + score2 === 3) {
            validation.textContent = '比赛未结束，总局数不能为3！';
            validation.style.display = 'block';
            return;
        }
        validation.style.display = 'none';
    }
    
    match.score1 = score1;
    match.score2 = score2;
    
    // 根据比分自动判断比赛状态
    if (match.mode === 'individual') {
        // 个人赛BO3：一方达到2局获胜，比赛结束
        if (score1 === 2 || score2 === 2) {
            match.status = 'completed';
            match.winnerId = score1 > score2 ? match.team1Id : match.team2Id;
        } else {
            // 未达到2局，比赛继续
            match.status = 'in_progress';
            match.winnerId = null;
        }
    } else {
        // 团队赛：有比分就认为已完成（可以根据需要调整）
        if (score1 > 0 || score2 > 0) {
            match.status = 'completed';
            match.winnerId = score1 > score2 ? match.team1Id : (score2 > score1 ? match.team2Id : null);
        } else {
            match.status = 'in_progress';
            match.winnerId = null;
        }
    }
    
    SaveDataToStorage();
    RenderRankingPreview();
    RenderAllTeams();
    HideMatchResultModal();
    
    // 如果比赛已完成，显示胜利动画
    if (match.status === 'completed' && match.winnerId) {
        const winnerTeam = teams.find(t => t.id === match.winnerId);
        if (winnerTeam) {
            ShowVictoryAnimation(winnerTeam.name);
        }
    } else {
        // 比赛未完成，返回比赛进行中界面
        ShowMatchInProgress(match);
    }
}

// 确认锦标赛比赛结果
function ConfirmTournamentMatchResult() {
    const tournamentId = matchResultModal.dataset.tournamentId;
    const groupId = matchResultModal.dataset.groupId;
    const matchId = matchResultModal.dataset.matchId;
    
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    // 查找小组（可能在groups、losersGroups、secondRoundGroups或finals中）
    let group = tournament.groups ? tournament.groups.find(g => g.id === groupId) : null;
    if (!group && tournament.losersGroups) {
        group = tournament.losersGroups.find(g => g.id === groupId);
    }
    if (!group && tournament.secondRoundGroups) {
        group = tournament.secondRoundGroups.find(g => g.id === groupId);
    }
    if (!group && tournament.finals) {
        group = tournament.finals.find(g => g.id === groupId);
    }
    if (!group) {
        alert('未找到对应的比赛组，请刷新页面重试');
        return;
    }
    
    const match = group.matches ? group.matches.find(m => m.id === matchId) : null;
    if (!match) {
        alert('未找到对应的比赛，请刷新页面重试');
        return;
    }
    
    const score1 = parseInt(document.getElementById('score1').value) || 0;
    const score2 = parseInt(document.getElementById('score2').value) || 0;
    
    // BO3验证
    const validation = document.getElementById('scoreValidation');
    if (score1 + score2 > 3) {
        validation.textContent = '总局数不能超过3局！';
        validation.style.display = 'block';
        return;
    }
    if (score1 > 2 || score2 > 2) {
        validation.textContent = '单方获胜局数不能超过2局！';
        validation.style.display = 'block';
        return;
    }
    if (score1 === 2 && score2 >= 2) {
        validation.textContent = '一方获胜2局后比赛结束，另一方不能有2局！';
        validation.style.display = 'block';
        return;
    }
    if (score2 === 2 && score1 >= 2) {
        validation.textContent = '一方获胜2局后比赛结束，另一方不能有2局！';
        validation.style.display = 'block';
        return;
    }
    if (score1 < 2 && score2 < 2 && score1 + score2 === 3) {
        validation.textContent = '比赛未结束，总局数不能为3！';
        validation.style.display = 'block';
        return;
    }
    validation.style.display = 'none';
    
    // 更新比赛结果
    match.score1 = score1;
    match.score2 = score2;
    
    if (score1 === 2 || score2 === 2) {
        match.status = 'completed';
        match.winner = score1 > score2 ? match.participant1 : match.participant2;
    } else {
        match.status = 'in_progress';
        match.winner = null;
    }
    
    // 计算小组排名（仅对小组赛）
    if (groupId.startsWith('group_')) {
        CalculateGroupRanking(group);
        // 检查小组赛是否全部完成，如果完成则生成败者组和第二轮
        if (AreAllGroupsCompleted(tournament)) {
            // 生成败者组（如果还没有生成）
            if (!tournament.losersGroups || tournament.losersGroups.length === 0) {
                const runnersUp = tournament.groups
                    .filter(g => g.runnerUp)
                    .map(g => g.runnerUp);
                if (runnersUp.length > 0) {
                    GenerateLosersGroups(tournament, runnersUp);
                }
            }
            // 生成第二轮（如果还没有生成）
            if (!tournament.secondRoundGroups || tournament.secondRoundGroups.length === 0) {
                GenerateSecondRound(tournament);
            }
        }
    } else if (groupId.startsWith('losers_group_')) {
        // 败者组：如果比赛完成，设置获胜者
        if (match.status === 'completed' && match.winner) {
            group.winner = match.winner;
        }
        // 检查败者组是否全部完成，如果完成且第二轮未生成，则生成第二轮
        if (AreAllLosersGroupsCompleted(tournament)) {
            if (!tournament.secondRoundGroups || tournament.secondRoundGroups.length === 0) {
                GenerateSecondRound(tournament);
            }
        }
    } else if (groupId.startsWith('second_round_group_')) {
        // 第二轮：如果比赛完成，设置获胜者
        if (match.status === 'completed' && match.winner) {
            group.winner = match.winner;
        }
        // 检查第二轮是否全部完成，如果完成则生成决赛
        if (AreAllSecondRoundGroupsCompleted(tournament)) {
            if (!tournament.finals || tournament.finals.length === 0) {
                GenerateFinals(tournament);
            }
        }
    } else if (groupId.startsWith('finals_group_')) {
        // 决赛：如果比赛完成，设置获胜者
        if (match.status === 'completed' && match.winner) {
            group.winner = match.winner;
        }
    }
    
    // 保存锦标赛
    const index = tournaments.findIndex(t => t.id === tournamentId);
    if (index !== -1) {
        tournaments[index] = tournament;
        localStorage.setItem('sf6Tournaments', JSON.stringify(tournaments));
    }
    HideMatchResultModal();
    
    // 刷新对战表
    if (tournamentBracketModal && tournamentBracketModal.classList.contains('show')) {
        const activeTab = document.querySelector('.tournament-tabs .tab-btn.active');
        RenderTournamentBracket(tournament, activeTab ? activeTab.dataset.stage : 'groups');
    }
}

// 检查所有小组是否完成
function AreAllGroupsCompleted(tournament) {
    if (!tournament.groups || tournament.groups.length === 0) return false;
    return tournament.groups.every(group => {
        if (!group.matches || group.matches.length === 0) return false;
        return group.matches.every(match => match.status === 'completed');
    });
}

// 检查所有败者组是否完成
function AreAllLosersGroupsCompleted(tournament) {
    if (!tournament.losersGroups || tournament.losersGroups.length === 0) return false;
    return tournament.losersGroups.every(group => {
        if (!group.matches || group.matches.length === 0) return group.winner !== null;
        return group.matches.every(match => match.status === 'completed') && group.winner !== null;
    });
}

// 检查所有第二轮是否完成
function AreAllSecondRoundGroupsCompleted(tournament) {
    if (!tournament.secondRoundGroups || tournament.secondRoundGroups.length === 0) return false;
    return tournament.secondRoundGroups.every(group => {
        if (!group.matches || group.matches.length === 0) return false;
        return group.matches.every(match => match.status === 'completed');
    });
}

// 计算小组排名
function CalculateGroupRanking(group) {
    const participants = group.participants;
    const standings = participants.map(p => ({
        participant: p,
        wins: 0,
        losses: 0,
        scoreDiff: 0
    }));
    
    // 统计每个参赛者的胜负
    group.matches.forEach(match => {
        if (match.status === 'completed' && match.winner) {
            const winnerIndex = standings.findIndex(s => s.participant.id === match.winner.id);
            const loserIndex = standings.findIndex(s => 
                s.participant.id !== match.winner.id && 
                (s.participant.id === match.participant1.id || s.participant.id === match.participant2.id)
            );
            
            if (winnerIndex !== -1 && loserIndex !== -1) {
                standings[winnerIndex].wins++;
                standings[loserIndex].losses++;
                standings[winnerIndex].scoreDiff += (match.score1 > match.score2 ? match.score1 - match.score2 : match.score2 - match.score1);
                standings[loserIndex].scoreDiff -= (match.score1 > match.score2 ? match.score1 - match.score2 : match.score2 - match.score1);
            }
        }
    });
    
    // 排序：胜场数 > 净胜分
    standings.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.scoreDiff - a.scoreDiff;
    });
    
    // 设置小组第一和第二
    if (standings.length > 0) {
        group.winner = standings[0].participant;
    }
    if (standings.length > 1) {
        group.runnerUp = standings[1].participant;
    }
}

// 显示胜利动画
function ShowVictoryAnimation(teamName) {
    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.innerHTML = `
        <div class="winner-team">🏆 ${teamName} 获胜！🏆</div>
    `;
    matchResultModal.classList.add('show');
    
    setTimeout(() => {
        HideMatchResultModal();
    }, 3000);
}

// 隐藏比赛结果弹窗
function HideMatchResultModal() {
    matchResultModal.classList.remove('show');
}

// 显示赛程表
function ShowSchedule() {
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = '';
    
    // 显示锦标赛
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    
    if (tournaments.length > 0) {
        tournaments.forEach(tournament => {
            const item = document.createElement('div');
            item.className = 'schedule-item tournament-item';
            const date = new Date(tournament.date).toLocaleString('zh-CN');
            const completedGroups = tournament.groups.filter(g => g.winner).length;
            item.innerHTML = `
                <div class="match-info">
                    <div class="match-teams-names">🏆 ${tournament.name}</div>
                    <div class="match-status in_progress">个人赛锦标赛</div>
                </div>
                <div style="color: #666; font-size: 0.9em; margin: 10px 0;">
                    参赛人数: ${tournament.participants.length} | 
                    已完成小组: ${completedGroups}/${tournament.groups.length}
                </div>
                <div class="schedule-item-footer">
                    <div style="color: #666; font-size: 0.9em;">${date}</div>
                    <div class="schedule-item-actions">
                        <button class="btn-continue-match" onclick="ShowTournamentBracketById('${tournament.id}')" title="查看对战表">📊 查看对战表</button>
                        <button class="btn-delete-schedule" onclick="DeleteTournament('${tournament.id}')" title="删除锦标赛">🗑️ 删除</button>
                    </div>
                </div>
            `;
            scheduleList.appendChild(item);
        });
    }
    
    // 显示常规比赛
    if (matches.length === 0 && tournaments.length === 0) {
        scheduleList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无比赛记录</p>';
    } else if (matches.length > 0) {
        matches.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(match => {
            const item = document.createElement('div');
            item.className = `schedule-item ${match.status}`;
            const date = new Date(match.date).toLocaleString('zh-CN');
            item.innerHTML = `
                <div class="match-info">
                    <div class="match-teams-names">${match.team1Name} VS ${match.team2Name}</div>
                    <div class="match-status ${match.status}">${match.status === 'completed' ? '已完成' : match.status === 'in_progress' ? '进行中' : '待开始'}</div>
                </div>
                ${match.status === 'completed' ? `
                    <div class="match-score">比分: ${match.score1} - ${match.score2}</div>
                ` : match.status === 'in_progress' ? `
                    <div class="match-score">比分: ${match.score1} - ${match.score2}</div>
                ` : ''}
                <div class="schedule-item-footer">
                    <div style="color: #666; font-size: 0.9em;">${date}</div>
                    <div class="schedule-item-actions">
                        ${match.status === 'in_progress' ? `
                            <button class="btn-continue-match" onclick="ContinueMatch('${match.id}')" title="继续比赛">▶️ 继续比赛</button>
                        ` : ''}
                        <button class="btn-edit-schedule" onclick="EditMatch('${match.id}')" title="编辑比赛">✏️ 编辑</button>
                        <button class="btn-delete-schedule" onclick="DeleteMatch('${match.id}')" title="删除比赛">🗑️ 删除</button>
                    </div>
                </div>
            `;
            scheduleList.appendChild(item);
        });
    }
    
    scheduleModal.classList.add('show');
}

// 隐藏赛程表
function HideScheduleModal() {
    scheduleModal.classList.remove('show');
}

// 编辑比赛
function EditMatch(matchId) {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    const team1 = teams.find(t => t.id === match.team1Id);
    const team2 = teams.find(t => t.id === match.team2Id);
    
    let formHTML = `
        <div class="form-group">
            <label>比赛模式：</label>
            <select id="editMatchMode" class="form-control">
                <option value="individual" ${match.mode === 'individual' ? 'selected' : ''}>个人赛</option>
                <option value="team" ${match.mode === 'team' ? 'selected' : ''}>团队赛</option>
            </select>
        </div>
        <div class="form-group">
            <label>比赛状态：</label>
            <select id="editMatchStatus" class="form-control">
                <option value="pending" ${match.status === 'pending' ? 'selected' : ''}>待开始</option>
                <option value="in_progress" ${match.status === 'in_progress' ? 'selected' : ''}>进行中</option>
                <option value="completed" ${match.status === 'completed' ? 'selected' : ''}>已完成</option>
            </select>
        </div>
        <div class="form-group">
            <label>${match.team1Name} 得分：</label>
            <input type="number" id="editScore1" min="0" value="${match.score1}" class="form-control">
        </div>
        <div class="form-group">
            <label>${match.team2Name} 得分：</label>
            <input type="number" id="editScore2" min="0" value="${match.score2}" class="form-control">
        </div>
        <div class="form-group">
            <label>比赛时间：</label>
            <input type="datetime-local" id="editMatchDate" class="form-control">
        </div>
    `;
    
    editMatchForm.innerHTML = formHTML;
    
    // 设置日期时间
    const dateInput = document.getElementById('editMatchDate');
    const matchDate = new Date(match.date);
    const year = matchDate.getFullYear();
    const month = String(matchDate.getMonth() + 1).padStart(2, '0');
    const day = String(matchDate.getDate()).padStart(2, '0');
    const hours = String(matchDate.getHours()).padStart(2, '0');
    const minutes = String(matchDate.getMinutes()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    editMatchModal.dataset.matchId = matchId;
    editMatchModal.classList.add('show');
}

// 隐藏编辑比赛弹窗
function HideEditMatchModal() {
    editMatchModal.classList.remove('show');
}

// 保存编辑的比赛
function SaveEditMatch() {
    const matchId = editMatchModal.dataset.matchId;
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    const mode = document.getElementById('editMatchMode').value;
    const status = document.getElementById('editMatchStatus').value;
    const score1 = parseInt(document.getElementById('editScore1').value) || 0;
    const score2 = parseInt(document.getElementById('editScore2').value) || 0;
    const dateInput = document.getElementById('editMatchDate').value;
    
    // 个人赛BO3验证
    if (mode === 'individual' && status === 'completed') {
        if (score1 + score2 > 3) {
            alert('个人赛总局数不能超过3局！');
            return;
        }
        if (score1 > 2 || score2 > 2) {
            alert('个人赛单方获胜局数不能超过2局！');
            return;
        }
        if (score1 === 2 && score2 >= 2) {
            alert('一方获胜2局后比赛结束，另一方不能有2局！');
            return;
        }
        if (score2 === 2 && score1 >= 2) {
            alert('一方获胜2局后比赛结束，另一方不能有2局！');
            return;
        }
    }
    
    // 更新比赛信息
    match.mode = mode;
    match.status = status;
    match.score1 = score1;
    match.score2 = score2;
    
    // 更新日期
    if (dateInput) {
        match.date = new Date(dateInput).toISOString();
    }
    
    // 更新获胜者
    if (status === 'completed') {
        match.winnerId = score1 > score2 ? match.team1Id : (score2 > score1 ? match.team2Id : null);
    } else {
        match.winnerId = null;
    }
    
    SaveDataToStorage();
    RenderRankingPreview();
    RenderAllTeams();
    HideEditMatchModal();
    
    // 如果赛程表弹窗是打开的，刷新它
    if (scheduleModal.classList.contains('show')) {
        ShowSchedule();
    }
    
    // 如果统计弹窗是打开的，刷新比赛历史
    if (statsModal.classList.contains('show')) {
        RenderMatchesHistory();
    }
}

// 继续比赛（重新打开比赛进行中界面）
function ContinueMatch(matchId) {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    if (match.status === 'in_progress') {
        currentMatchInProgress = match;
        ShowMatchInProgress(match);
        HideScheduleModal(); // 关闭赛程表，显示比赛进行中界面
    }
}

// 删除比赛
function DeleteMatch(matchId) {
    if (confirm('确定要删除这场比赛吗？')) {
        const index = matches.findIndex(m => m.id === matchId);
        if (index !== -1) {
            matches.splice(index, 1);
            SaveDataToStorage();
            RenderRankingPreview();
            RenderAllTeams();
            
            // 如果赛程表弹窗是打开的，刷新它
            if (scheduleModal.classList.contains('show')) {
                ShowSchedule();
            }
            
            // 如果统计弹窗是打开的，刷新比赛历史
            if (statsModal.classList.contains('show')) {
                RenderMatchesHistory();
            }
        }
    }
}

// 显示统计
function ShowStats() {
    // 切换标签
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab + 'Tab').classList.add('active');
        });
    });
    
    RenderTeamsRanking();
    RenderMembersRanking();
    RenderMatchesHistory();
    
    statsModal.classList.add('show');
}

// 隐藏统计
function HideStatsModal() {
    statsModal.classList.remove('show');
}

// 渲染队伍排名
function RenderTeamsRanking() {
    const teamsRanking = document.getElementById('teamsRanking');
    teamsRanking.innerHTML = '';
    
    const teamsWithStats = teams.map(team => {
        const teamMatches = matches.filter(m => 
            (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'completed'
        );
        const wins = teamMatches.filter(m => m.winnerId === team.id).length;
        const losses = teamMatches.length - wins;
        
        return {
            ...team,
            points: GetTeamPoints(team.id),
            wins,
            losses,
            total: teamMatches.length
        };
    }).sort((a, b) => b.points - a.points);
    
    teamsWithStats.forEach((team, index) => {
        const item = document.createElement('div');
        item.className = `ranking-full-item rank-${index + 1 <= 3 ? index + 1 : ''}`;
        item.innerHTML = `
            <div class="rank-number rank-${index + 1}">${index + 1}</div>
            <div>
                <div style="font-weight: bold; font-size: 1.1em;">${team.name}</div>
                <div style="color: #666; font-size: 0.9em;">胜 ${team.wins} / 负 ${team.losses} / 总 ${team.total}</div>
            </div>
                <div style="text-align: right;">
                <div style="font-size: 1.2em; font-weight: bold; color: #667eea;">${team.points}</div>
                <div style="color: #999; font-size: 0.9em;">积分</div>
            </div>
        `;
        teamsRanking.appendChild(item);
    });
}

// 渲染个人排名
function RenderMembersRanking() {
    const membersRanking = document.getElementById('membersRanking');
    membersRanking.innerHTML = '';
    
    const allMembers = [];
    teams.forEach(team => {
        if (team.members) {
            team.members.forEach(member => {
                allMembers.push({
                    ...member,
                    teamName: team.name
                });
            });
        }
    });
    
    // 按段位排序（段位等级映射）
    const rankOrder = {'大师': 8, '钻石': 7, '白金': 6, '金': 5, '银': 4, '铜': 3, '铁': 2, '新手': 1};
    allMembers.sort((a, b) => (rankOrder[b.rank] || 0) - (rankOrder[a.rank] || 0));
    
    allMembers.slice(0, 20).forEach((member, index) => {
        const item = document.createElement('div');
        item.className = `ranking-full-item rank-${index + 1 <= 3 ? index + 1 : ''}`;
        item.innerHTML = `
            <div class="rank-number rank-${index + 1}">${index + 1}</div>
            <div>
                <div style="font-weight: bold; font-size: 1.1em;">${member.name}</div>
                <div style="color: #666; font-size: 0.9em;">${member.teamName} · ${member.character}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.2em; font-weight: bold; color: #667eea;">${member.rank}</div>
                <div style="color: #999; font-size: 0.9em;">段位</div>
            </div>
        `;
        membersRanking.appendChild(item);
    });
}

// 渲染比赛历史
function RenderMatchesHistory() {
    const matchesHistory = document.getElementById('matchesHistory');
    matchesHistory.innerHTML = '';
    
    if (matches.length === 0) {
        matchesHistory.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无比赛记录</p>';
        return;
    }
    
    matches.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(match => {
        const item = document.createElement('div');
        item.className = `schedule-item ${match.status}`;
        const date = new Date(match.date).toLocaleString('zh-CN');
        item.innerHTML = `
            <div class="match-info">
                <div class="match-teams-names">${match.team1Name} VS ${match.team2Name}</div>
                <div class="match-status ${match.status}">${match.status === 'completed' ? '已完成' : match.status === 'in_progress' ? '进行中' : '待开始'}</div>
            </div>
            ${match.status === 'completed' ? `
                <div class="match-score">比分: <strong>${match.score1}</strong> - <strong>${match.score2}</strong></div>
                ${match.winnerId ? `<div style="color: #ffd700; font-weight: bold; margin-top: 5px;">🏆 获胜: ${match.winnerId === match.team1Id ? match.team1Name : match.team2Name}</div>` : ''}
            ` : match.status === 'in_progress' ? `
                <div class="match-score">比分: <strong>${match.score1}</strong> - <strong>${match.score2}</strong></div>
            ` : ''}
            <div class="schedule-item-footer">
                <div style="color: #666; font-size: 0.9em;">${date}</div>
                <div class="schedule-item-actions">
                    ${match.status === 'in_progress' ? `
                        <button class="btn-continue-match" onclick="ContinueMatch('${match.id}')" title="继续比赛">▶️ 继续比赛</button>
                    ` : ''}
                    <button class="btn-edit-schedule" onclick="EditMatch('${match.id}')" title="编辑比赛">✏️ 编辑</button>
                    <button class="btn-delete-schedule" onclick="DeleteMatch('${match.id}')" title="删除比赛">🗑️ 删除</button>
                </div>
            </div>
        `;
        matchesHistory.appendChild(item);
    });
}

// 更新队伍卡片显示积分
function UpdateTeamCardPoints() {
    document.querySelectorAll('.team-card').forEach(card => {
        const teamId = card.dataset.teamId;
        const team = teams.find(t => t.id === teamId);
        if (team) {
            const points = GetTeamPoints(teamId);
            let pointsDisplay = card.querySelector('.team-points');
            if (!pointsDisplay) {
                const teamHeader = card.querySelector('.team-header');
                pointsDisplay = document.createElement('div');
                pointsDisplay.className = 'team-points';
                pointsDisplay.style.cssText = 'font-size: 0.9em; color: #ffd700; font-weight: bold; margin-top: 5px;';
                teamHeader.appendChild(pointsDisplay);
            }
            pointsDisplay.textContent = `积分: ${points}`;
        }
    });
}

// ==================== 个人赛功能 ====================

// 快速匹配个人赛（将公共池所有人加入）
function QuickMatchIndividual() {
    if (memberPool.length === 0) {
        alert('公共池中暂无成员，请先添加成员到公共池');
        return;
    }
    
    // 将公共池所有成员加入个人赛
    individualParticipants = memberPool.map((member, index) => ({
        id: `pool_${index}`,
        name: member.name,
        character: member.character,
        rank: member.rank,
        note: member.note,
        source: 'pool',
        index: index
    }));
    
    SaveDataToStorage();
    RenderIndividualParticipants();
    
    // 切换到个人赛模式
    if (currentMatchMode !== 'individual') {
        document.querySelector('.mode-btn[data-mode="individual"]').click();
    }
}

// 显示个人赛匹配（手动选择）
function ShowIndividualMatch() {
    selectedIndividualMembers = [];
    RenderIndividualMatchSelectLists();
    UpdateSelectedIndividualMembers();
    individualMatchModal.classList.add('show');
}

// 渲染个人赛手动匹配选择列表
function RenderIndividualMatchSelectLists() {
    poolSelectList.innerHTML = '';
    teamSelectList.innerHTML = '';
    
    // 公共池成员
    memberPool.forEach((member, index) => {
        const item = CreateIndividualSelectItem(member, 'pool', index);
        poolSelectList.appendChild(item);
    });
    
    // 队伍成员
    teams.forEach(team => {
        if (team.members && team.members.length > 0) {
            team.members.forEach((member, index) => {
                const item = CreateIndividualSelectItem(member, 'team', index, team.id, team.name);
                teamSelectList.appendChild(item);
            });
        }
    });
    
    if (poolSelectList.children.length === 0 && teamSelectList.children.length === 0) {
        poolSelectList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无可用成员</p>';
    }
}

// 创建个人赛选择项
function CreateIndividualSelectItem(member, source, index, teamId = null, teamName = null) {
    const item = document.createElement('div');
    item.className = 'individual-select-item';
    const memberId = `${source}_${teamId || 'pool'}_${index}`;
    const isSelected = selectedIndividualMembers.some(m => m.id === memberId);
    
    // 创建复选框并绑定事件
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isSelected;
    checkbox.style.cssText = 'cursor: pointer; position: relative; z-index: 10; pointer-events: auto; width: 18px; height: 18px;';
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        ToggleIndividualMember(memberId, member.name, member.character, member.rank, member.note || '', source, teamId || '', teamName || '');
    });
    
    item.innerHTML = `
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 10px; border-radius: 8px; transition: background 0.3s; ${isSelected ? 'background: rgba(102, 126, 234, 0.2);' : ''}; position: relative; z-index: 1;">
            <div style="flex: 1;">
                <div style="font-weight: bold;">${member.name}</div>
                <div style="font-size: 0.9em; color: #666;">${member.character} · ${member.rank}${teamName ? ` · ${teamName}` : ''}</div>
            </div>
        </label>
    `;
    
    // 将复选框插入到label开头
    const label = item.querySelector('label');
    label.insertBefore(checkbox, label.firstChild);
    
    return item;
}

// 切换个人赛成员选择（确保在全局作用域）
window.ToggleIndividualMember = function(id, name, character, rank, note, source, teamId, teamName) {
    const index = selectedIndividualMembers.findIndex(m => m.id === id);
    if (index === -1) {
        selectedIndividualMembers.push({
            id: id,
            name: name,
            character: character,
            rank: rank,
            note: note,
            source: source,
            teamId: teamId || null,
            teamName: teamName || null
        });
    } else {
        selectedIndividualMembers.splice(index, 1);
    }
    UpdateSelectedIndividualMembers();
    RenderIndividualMatchSelectLists(); // 重新渲染以更新复选框状态
};

// 更新已选个人赛成员显示
function UpdateSelectedIndividualMembers() {
    selectedIndividualCount.textContent = selectedIndividualMembers.length;
    selectedIndividualList.innerHTML = '';
    
    if (selectedIndividualMembers.length === 0) {
        selectedIndividualList.innerHTML = '<p style="color: #999; text-align: center; padding: 10px;">暂无选中成员</p>';
        return;
    }
    
    selectedIndividualMembers.forEach(member => {
        const item = document.createElement('div');
        item.className = 'selected-individual-item';
        item.style.cssText = 'position: relative; z-index: 1;';
        
        // 创建移除按钮并绑定事件
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-remove-participant';
        removeBtn.textContent = '×';
        removeBtn.style.cssText = 'position: relative; z-index: 10; pointer-events: auto !important; cursor: pointer !important;';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            RemoveIndividualMember(member.id);
        });
        
        item.innerHTML = `<span>${member.name} (${member.character}) - ${member.rank}</span>`;
        item.appendChild(removeBtn);
        selectedIndividualList.appendChild(item);
    });
}

// 移除已选个人赛成员（确保在全局作用域）
window.RemoveIndividualMember = function(id) {
    selectedIndividualMembers = selectedIndividualMembers.filter(m => m.id !== id);
    UpdateSelectedIndividualMembers();
    RenderIndividualMatchSelectLists();
};

// 确认个人赛手动匹配
function ConfirmIndividualMatch() {
    if (selectedIndividualMembers.length === 0) {
        alert('请至少选择一个成员');
        return;
    }
    
    // 将选中的成员添加到个人赛参赛者列表（避免重复）
    selectedIndividualMembers.forEach(member => {
        const exists = individualParticipants.some(p => 
            p.name === member.name && p.character === member.character
        );
        if (!exists) {
            individualParticipants.push({
                id: member.id,
                name: member.name,
                character: member.character,
                rank: member.rank,
                note: member.note,
                source: member.source,
                index: individualParticipants.length
            });
        }
    });
    
    SaveDataToStorage();
    RenderIndividualParticipants();
    HideIndividualMatchModal();
    
    // 切换到个人赛模式
    if (currentMatchMode !== 'individual') {
        document.querySelector('.mode-btn[data-mode="individual"]').click();
    }
}

// 隐藏个人赛手动匹配弹窗
function HideIndividualMatchModal() {
    individualMatchModal.classList.remove('show');
    selectedIndividualMembers = [];
}

// 渲染个人赛参赛者
function RenderIndividualParticipants() {
    individualMembers.innerHTML = '';
    individualCount.textContent = `(${individualParticipants.length})`;
    
    if (individualParticipants.length === 0) {
        individualMembers.innerHTML = '<div class="empty-individual">暂无参赛者，点击"快速匹配"将公共池成员加入</div>';
        return;
    }
    
    individualParticipants.forEach((participant, index) => {
        const memberCard = CreateIndividualMemberCard(participant, index);
        individualMembers.appendChild(memberCard);
    });
}

// 创建个人赛成员卡片
function CreateIndividualMemberCard(participant, index) {
    const card = document.createElement('div');
    card.className = 'member-card individual-member';
    card.dataset.index = index;
    
    // 计算该参赛者的比赛统计
    let wins = 0;
    let losses = 0;
    let totalMatches = 0;
    
    // 统计个人赛比赛记录
    matches.forEach(match => {
        if (match.mode === 'individual') {
            // 检查该参赛者是否参与这场比赛
            const team1 = teams.find(t => t.id === match.team1Id);
            const team2 = teams.find(t => t.id === match.team2Id);
            
            if (team1 && team1.members && team1.members.some(m => m.name === participant.name)) {
                totalMatches++;
                if (match.winnerId === match.team1Id) wins++;
                else if (match.winnerId === match.team2Id) losses++;
            } else if (team2 && team2.members && team2.members.some(m => m.name === participant.name)) {
                totalMatches++;
                if (match.winnerId === match.team2Id) wins++;
                else if (match.winnerId === match.team1Id) losses++;
            }
        }
    });
    
    // 创建移除按钮，使用事件监听而不是onclick
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-icon';
    removeBtn.title = '移除';
    removeBtn.textContent = '🗑️';
    removeBtn.style.cssText = 'background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1em; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        RemoveIndividualParticipant(index);
    });
    
    card.innerHTML = `
        <div class="member-header">
            <div class="member-name">${participant.name}</div>
            <div class="member-actions"></div>
        </div>
        <div class="member-info">
            <div class="member-info-item">
                <span class="member-info-label">角色：</span>
                <span class="member-info-value">${participant.character}</span>
            </div>
            <div class="member-info-item">
                <span class="member-info-label">段位：</span>
                <span class="member-info-value rank-badge">${participant.rank}</span>
            </div>
            <div class="member-info-item">
                <span class="member-info-label">战绩：</span>
                <span class="member-info-value">${wins}胜 ${losses}负 (${totalMatches}场)</span>
            </div>
        </div>
        ${participant.note ? `<div class="member-note">📝 ${participant.note}</div>` : ''}
    `;
    
    // 将移除按钮添加到member-actions容器
    const memberActions = card.querySelector('.member-actions');
    if (memberActions) {
        memberActions.appendChild(removeBtn);
    }
    
    return card;
}

// 移除个人赛参赛者（确保在全局作用域）
window.RemoveIndividualParticipant = function(index) {
    if (typeof index === 'string') {
        index = parseInt(index);
    }
    if (isNaN(index) || index < 0 || index >= individualParticipants.length) {
        console.error('Invalid index for RemoveIndividualParticipant:', index);
        return;
    }
    individualParticipants.splice(index, 1);
    SaveDataToStorage();
    RenderIndividualParticipants();
};

// 清空个人赛参赛者
function ClearIndividualParticipants() {
    if (individualParticipants.length === 0) return;
    
    if (confirm('确定要清空所有个人赛参赛者吗？')) {
        individualParticipants = [];
        SaveDataToStorage();
        RenderIndividualParticipants();
    }
}

// 生成个人赛对战表
function GenerateIndividualBracket() {
    if (individualParticipants.length < 2) {
        alert('至少需要2名参赛者才能生成对战表');
        return;
    }
    
    // 创建锦标赛
    const tournament = {
        id: GenerateId(),
        name: `个人赛锦标赛 - ${new Date().toLocaleDateString('zh-CN')}`,
        participants: individualParticipants.map(p => ({
            id: p.id,
            name: p.name,
            character: p.character,
            rank: p.rank
        })),
        stage: 'groups',
        groups: [],
        losersGroups: [],
        secondRoundGroups: [],
        finals: [],
        date: new Date().toISOString()
    };
    
    // 生成分组
    GenerateTournamentGroups(tournament);
    
    // 保存锦标赛到localStorage
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    tournaments.push(tournament);
    localStorage.setItem('sf6Tournaments', JSON.stringify(tournaments));
    
    // 显示对战表
    ShowTournamentBracket(tournament);
    
    // 更新标签页名称
    UpdateTournamentTabs(tournament);
}


// 生成锦标赛分组（根据参赛人数灵活调整）
function GenerateTournamentGroups(tournament) {
    const participants = [...tournament.participants];
    const participantCount = participants.length;
    
    // 根据参赛人数选择最优赛制
    const tournamentFormat = DetermineTournamentFormat(participantCount);
    tournament.format = tournamentFormat; // 保存赛制信息
    
    // 随机打乱参赛者
    const shuffled = participants.sort(() => Math.random() - 0.5);
    
    if (tournamentFormat.type === 'single_elimination') {
        // 单淘汰赛
        GenerateSingleElimination(tournament, shuffled);
    } else if (tournamentFormat.type === 'double_elimination') {
        // 双败淘汰赛
        GenerateDoubleElimination(tournament, shuffled);
    } else if (tournamentFormat.type === 'round_robin') {
        // 循环赛（所有人互相比赛）
        GenerateRoundRobin(tournament, shuffled);
    } else if (tournamentFormat.type === 'group_stage') {
        // 小组赛+淘汰赛
        GenerateGroupStage(tournament, shuffled, tournamentFormat);
    }
}

// 根据参赛人数确定最优赛制
function DetermineTournamentFormat(participantCount) {
    if (participantCount <= 2) {
        // 2人：直接单淘汰
        return { type: 'single_elimination', description: '单淘汰赛' };
    } else if (participantCount <= 4) {
        // 3-4人：单淘汰或循环赛
        return { type: 'round_robin', description: '循环赛（所有人互相比赛）' };
    } else if (participantCount <= 8) {
        // 5-8人：小组赛+淘汰赛（2组，每组3-4人）
        const groupSize = participantCount <= 6 ? 3 : 4;
        const groupCount = Math.ceil(participantCount / groupSize);
        return { 
            type: 'group_stage', 
            description: `小组赛（${groupCount}组，每组${groupSize}人）`,
            groupSize: groupSize,
            groupCount: groupCount,
            advancePerGroup: Math.min(2, Math.floor(groupSize / 2)) // 每组晋级人数
        };
    } else if (participantCount <= 16) {
        // 9-16人：小组赛+淘汰赛（每组4人）
        const groupCount = Math.ceil(participantCount / 4);
        return { 
            type: 'group_stage', 
            description: `小组赛（${groupCount}组，每组4人）`,
            groupSize: 4,
            groupCount: groupCount,
            advancePerGroup: 2 // 每组前2名晋级
        };
    } else if (participantCount <= 32) {
        // 17-32人：小组赛+淘汰赛（每组4-5人）
        const groupSize = participantCount <= 24 ? 4 : 5;
        const groupCount = Math.ceil(participantCount / groupSize);
        return { 
            type: 'group_stage', 
            description: `小组赛（${groupCount}组，每组${groupSize}人）`,
            groupSize: groupSize,
            groupCount: groupCount,
            advancePerGroup: 2
        };
    } else {
        // 33+人：多轮小组赛
        // 第一轮：每组5-6人
        const groupSize = participantCount <= 48 ? 5 : 6;
        const groupCount = Math.ceil(participantCount / groupSize);
        return { 
            type: 'group_stage', 
            description: `小组赛（${groupCount}组，每组${groupSize}人）`,
            groupSize: groupSize,
            groupCount: groupCount,
            advancePerGroup: 2
        };
    }
}

// 生成单淘汰赛
function GenerateSingleElimination(tournament, participants) {
    tournament.groups = [];
    tournament.eliminationBracket = [];
    
    // 如果是2的幂次，直接生成淘汰赛
    // 如果不是，需要先进行预选赛
    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(participants.length)));
    const byes = powerOfTwo - participants.length;
    
    if (byes > 0) {
        // 需要预选赛
        const preQualifyCount = byes * 2;
        const preQualifyGroup = {
            id: 'pre_qualify',
            name: '预选赛',
            participants: participants.slice(0, preQualifyCount),
            matches: [],
            winner: null,
            runnerUp: null
        };
        GenerateGroupMatches(preQualifyGroup);
        tournament.groups.push(preQualifyGroup);
        
        // 预选赛晋级者 + 直接晋级的选手
        const qualified = [...participants.slice(preQualifyCount)];
        // 预选赛的晋级者会在比赛完成后添加
    } else {
        // 直接生成淘汰赛
        GenerateEliminationBracket(tournament, participants);
    }
}

// 生成双败淘汰赛
function GenerateDoubleElimination(tournament, participants) {
    // 双败淘汰赛比较复杂，先简化为小组赛+败者组
    GenerateGroupStage(tournament, participants, {
        type: 'group_stage',
        groupSize: 4,
        groupCount: Math.ceil(participants.length / 4),
        advancePerGroup: 2
    });
}

// 生成循环赛（所有人互相比赛）
function GenerateRoundRobin(tournament, participants) {
    tournament.groups = [];
    const group = {
        id: 'round_robin',
        name: '循环赛',
        participants: participants,
        matches: [],
        winner: null,
        runnerUp: null
    };
    GenerateGroupMatches(group);
    tournament.groups.push(group);
}

// 生成小组赛+淘汰赛
function GenerateGroupStage(tournament, participants, format) {
    const groupSize = format.groupSize;
    const groupCount = format.groupCount;
    
    tournament.groups = [];
    
    // 计算每组人数，尽量均匀分配
    const baseSize = Math.floor(participants.length / groupCount);
    const remainder = participants.length % groupCount;
    
    let currentIndex = 0;
    for (let i = 0; i < groupCount; i++) {
        // 前remainder组多1人
        const actualGroupSize = i < remainder ? baseSize + 1 : baseSize;
        const groupParticipants = participants.slice(currentIndex, currentIndex + actualGroupSize);
        currentIndex += actualGroupSize;
        
        if (groupParticipants.length === 0) continue;
        
        const group = {
            id: `group_${String.fromCharCode(65 + i)}`, // A, B, C...
            name: `第${String.fromCharCode(65 + i)}组`,
            participants: groupParticipants,
            matches: [],
            winner: null,
            runnerUp: null
        };
        
        // 生成小组内循环赛
        GenerateGroupMatches(group);
        tournament.groups.push(group);
    }
}

// 生成淘汰赛对阵表
function GenerateEliminationBracket(tournament, participants) {
    // 实现单淘汰赛对阵表生成
    // 这里可以后续扩展
}

// 生成小组内循环赛（抢3）
function GenerateGroupMatches(group) {
    const participants = group.participants;
    group.matches = [];
    
    // 循环赛：每两人之间都要对战
    for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
            const match = {
                id: GenerateId(),
                participant1: participants[i],
                participant2: participants[j],
                score1: 0,
                score2: 0,
                winner: null,
                status: 'pending' // pending, in_progress, completed
            };
            group.matches.push(match);
        }
    }
}

// 显示锦标赛对战表（通过ID）
function ShowTournamentBracketById(tournamentId) {
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament) {
        ShowTournamentBracket(tournament);
    }
}

// 显示锦标赛对战表
function ShowTournamentBracket(tournament) {
    if (!tournamentBracketModal) return;
    
    tournamentBracketTitle.textContent = tournament.name;
    UpdateTournamentTabs(tournament);
    RenderTournamentBracket(tournament, 'groups');
    tournamentBracketModal.classList.add('show');
}

// 删除锦标赛
function DeleteTournament(tournamentId) {
    if (confirm('确定要删除这个锦标赛吗？此操作不可恢复！')) {
        let tournaments = [];
        const savedTournaments = localStorage.getItem('sf6Tournaments');
        if (savedTournaments) {
            tournaments = JSON.parse(savedTournaments);
        }
        
        const index = tournaments.findIndex(t => t.id === tournamentId);
        if (index !== -1) {
            tournaments.splice(index, 1);
            localStorage.setItem('sf6Tournaments', JSON.stringify(tournaments));
            if (scheduleModal.classList.contains('show')) {
                ShowSchedule();
            }
        }
    }
}

// 隐藏锦标赛对战表
function HideTournamentBracket() {
    if (tournamentBracketModal) {
        tournamentBracketModal.classList.remove('show');
    }
}

// 渲染锦标赛对战表
function RenderTournamentBracket(tournament, stage) {
    bracketContent.innerHTML = '';
    
    // 更新标签页名称
    UpdateTournamentTabs(tournament);
    
    if (stage === 'groups') {
        RenderGroupsStage(tournament);
    } else if (stage === 'losers') {
        RenderLosersStage(tournament);
    } else if (stage === 'second_round') {
        RenderSecondRoundStage(tournament);
    } else if (stage === 'finals') {
        RenderFinalsStage(tournament);
    }
}

// 渲染第一天：小组赛
function RenderGroupsStage(tournament) {
    // 显示赛制信息
    if (tournament.format) {
        const formatInfo = document.createElement('div');
        formatInfo.className = 'tournament-format-info';
        formatInfo.style.cssText = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-size: 1.1em; font-weight: bold;';
        formatInfo.textContent = `📋 赛制：${tournament.format.description} | 参赛人数：${tournament.participants.length}人`;
        bracketContent.appendChild(formatInfo);
    }
    
    if (!tournament.groups || tournament.groups.length === 0) {
        bracketContent.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无分组信息</p>';
        return;
    }
    
    tournament.groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'tournament-group';
        
        // 计算小组内比赛总数
        const totalMatches = group.matches.length;
        const completedMatches = group.matches.filter(m => m.status === 'completed').length;
        const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
        
        groupDiv.innerHTML = `
            <h3>${group.name} <span style="font-size: 0.8em; color: #666; font-weight: normal;">(${group.participants.length}人)</span></h3>
            <div class="group-progress" style="margin-bottom: 10px;">
                <div style="background: #e0e0e0; border-radius: 10px; height: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.85em; color: #666; margin-top: 5px;">进度：${completedMatches}/${totalMatches} 场 (${progress}%)</div>
            </div>
            <div class="group-participants">
                ${group.participants.map(p => `
                    <div class="participant-tag">${p.name} (${p.character})</div>
                `).join('')}
            </div>
            <div class="group-matches">
                <h4>对战表（BO3）</h4>
                ${group.matches.length === 0 ? '<p style="color: #999; text-align: center; padding: 10px;">暂无对战</p>' : group.matches.map(match => {
                    const statusClass = match.status === 'completed' ? 'completed' : match.status === 'in_progress' ? 'in_progress' : 'pending';
                    const statusText = match.status === 'completed' ? '已完成' : match.status === 'in_progress' ? '进行中' : '待开始';
                    const statusIcon = match.status === 'completed' ? '✓' : match.status === 'in_progress' ? '⚡' : '○';
                    const p1Winner = match.winner && match.winner.id === match.participant1.id;
                    const p2Winner = match.winner && match.winner.id === match.participant2.id;
                    return `
                    <div class="tournament-match-item ${statusClass}">
                        <div class="match-status-badge ${statusClass}">
                            <span class="status-icon">${statusIcon}</span>
                            <span class="status-text">${statusText}</span>
                        </div>
                        <div class="match-participants">
                            <div class="participant-card ${p1Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant1.name}</div>
                                <div class="participant-character">${match.participant1.character || ''}</div>
                            </div>
                            <div class="match-score-display">
                                <div class="score-large ${p1Winner ? 'winner-score' : ''}">${match.score1 || 0}</div>
                                <div class="score-divider">:</div>
                                <div class="score-large ${p2Winner ? 'winner-score' : ''}">${match.score2 || 0}</div>
                            </div>
                            <div class="participant-card ${p2Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant2.name}</div>
                                <div class="participant-character">${match.participant2.character || ''}</div>
                            </div>
                        </div>
                        <button class="btn-edit-match" onclick="EditTournamentMatch('${tournament.id}', '${group.id}', '${match.id}')" title="编辑比分">
                            <span class="edit-icon">✏️</span>
                            <span class="edit-text">编辑</span>
                        </button>
                    </div>
                `;
                }).join('')}
            </div>
            ${group.winner ? `<div class="group-result" style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 10px; border-radius: 8px; margin-top: 10px; font-weight: bold;">🥇 小组第一: ${group.winner.name}</div>` : ''}
            ${group.runnerUp ? `<div class="group-result" style="background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%); color: #333; padding: 10px; border-radius: 8px; margin-top: 5px; font-weight: bold;">🥈 小组第二: ${group.runnerUp.name}</div>` : ''}
        `;
        bracketContent.appendChild(groupDiv);
    });
}

// 渲染第二天：败者组
function RenderLosersStage(tournament) {
    // 收集所有小组第二
    const runnersUp = tournament.groups
        .filter(g => g.runnerUp)
        .map(g => g.runnerUp);
    
    if (runnersUp.length === 0) {
        bracketContent.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">需要先完成第一天的小组赛</p>';
        return;
    }
    
    // 如果败者组还没有生成，则生成败者组比赛
    if (!tournament.losersGroups || tournament.losersGroups.length === 0) {
        GenerateLosersGroups(tournament, runnersUp);
    }
    
    // 渲染败者组
    tournament.losersGroups.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'tournament-group';
        groupDiv.innerHTML = `
            <h3>败者组 ${index + 1}</h3>
            <div class="group-participants">
                ${group.participants.map(p => `
                    <div class="participant-tag">${p.name} (${p.character})</div>
                `).join('')}
            </div>
            <div class="group-matches">
                <h4>对战表（BO3）</h4>
                ${!group.matches || group.matches.length === 0 ? '<p style="color: #999; text-align: center; padding: 10px;">暂无对战</p>' : group.matches.map(match => {
                    const statusClass = match.status === 'completed' ? 'completed' : match.status === 'in_progress' ? 'in_progress' : 'pending';
                    const statusText = match.status === 'completed' ? '已完成' : match.status === 'in_progress' ? '进行中' : '待开始';
                    const statusIcon = match.status === 'completed' ? '✓' : match.status === 'in_progress' ? '⚡' : '○';
                    const p1Winner = match.winner && match.winner.id === match.participant1.id;
                    const p2Winner = match.winner && match.winner.id === match.participant2.id;
                    return `
                    <div class="tournament-match-item ${statusClass}">
                        <div class="match-status-badge ${statusClass}">
                            <span class="status-icon">${statusIcon}</span>
                            <span class="status-text">${statusText}</span>
                        </div>
                        <div class="match-participants">
                            <div class="participant-card ${p1Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant1.name}</div>
                                <div class="participant-character">${match.participant1.character || ''}</div>
                            </div>
                            <div class="match-score-display">
                                <div class="score-large ${p1Winner ? 'winner-score' : ''}">${match.score1 || 0}</div>
                                <div class="score-divider">:</div>
                                <div class="score-large ${p2Winner ? 'winner-score' : ''}">${match.score2 || 0}</div>
                            </div>
                            <div class="participant-card ${p2Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant2.name}</div>
                                <div class="participant-character">${match.participant2.character || ''}</div>
                            </div>
                        </div>
                        <button class="btn-edit-match" onclick="EditTournamentMatch('${tournament.id}', '${group.id}', '${match.id}')" title="编辑比分">
                            <span class="edit-icon">✏️</span>
                            <span class="edit-text">编辑</span>
                        </button>
                    </div>
                `;
                }).join('')}
            </div>
            ${group.winner ? `<div class="group-result" style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 10px; border-radius: 8px; margin-top: 10px; font-weight: bold;">🏆 获胜者: ${group.winner.name}</div>` : ''}
        `;
        bracketContent.appendChild(groupDiv);
    });
}

// 生成败者组比赛
function GenerateLosersGroups(tournament, runnersUp) {
    if (!tournament.losersGroups) {
        tournament.losersGroups = [];
    }
    
    // 将小组第二分成败者组，每组2人进行单败淘汰
    const shuffled = [...runnersUp].sort(() => Math.random() - 0.5);
    const groupCount = Math.ceil(shuffled.length / 2);
    
    for (let i = 0; i < groupCount; i++) {
        const participants = shuffled.slice(i * 2, (i + 1) * 2);
        if (participants.length === 0) continue;
        
        const group = {
            id: `losers_group_${i + 1}`,
            name: `败者组 ${i + 1}`,
            participants: participants,
            matches: [],
            winner: null
        };
        
        // 如果只有1人，直接晋级
        if (participants.length === 1) {
            group.winner = participants[0];
        } else {
            // 生成比赛
            const match = {
                id: GenerateId(),
                participant1: participants[0],
                participant2: participants[1],
                score1: 0,
                score2: 0,
                status: 'pending',
                winner: null
            };
            group.matches.push(match);
        }
        
        tournament.losersGroups.push(group);
    }
    
    // 保存锦标赛
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    const index = tournaments.findIndex(t => t.id === tournament.id);
    if (index !== -1) {
        tournaments[index] = tournament;
        localStorage.setItem('sf6Tournaments', JSON.stringify(tournaments));
    }
}

// 生成第二轮（小组第一 + 败者组获胜者）
function GenerateSecondRound(tournament) {
    if (!tournament.secondRoundGroups) {
        tournament.secondRoundGroups = [];
    }
    
    // 收集小组第一
    const groupWinners = tournament.groups
        .filter(g => g.winner)
        .map(g => g.winner);
    
    // 收集败者组获胜者
    const losersWinners = tournament.losersGroups
        .filter(g => g.winner)
        .map(g => g.winner);
    
    // 合并所有晋级者
    const secondRoundParticipants = [...groupWinners, ...losersWinners];
    
    if (secondRoundParticipants.length < 2) {
        return; // 至少需要2人才能进行第二轮
    }
    
    // 根据人数决定分组方式
    const participantCount = secondRoundParticipants.length;
    let groupSize = 4;
    let groupCount = Math.ceil(participantCount / groupSize);
    
    // 如果人数较少，调整分组
    if (participantCount <= 4) {
        groupSize = participantCount;
        groupCount = 1;
    } else if (participantCount <= 8) {
        groupSize = 4;
        groupCount = 2;
    }
    
    // 随机打乱
    const shuffled = [...secondRoundParticipants].sort(() => Math.random() - 0.5);
    
    let currentIndex = 0;
    for (let i = 0; i < groupCount; i++) {
        const actualGroupSize = i < groupCount - 1 ? groupSize : (participantCount - currentIndex);
        const groupParticipants = shuffled.slice(currentIndex, currentIndex + actualGroupSize);
        currentIndex += actualGroupSize;
        
        if (groupParticipants.length < 2) continue;
        
        const group = {
            id: `second_round_group_${i + 1}`,
            name: `第二轮 第${i + 1}组`,
            participants: groupParticipants,
            matches: [],
            winner: null,
            runnerUp: null
        };
        
        GenerateGroupMatches(group);
        tournament.secondRoundGroups.push(group);
    }
    
    // 保存锦标赛
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    const index = tournaments.findIndex(t => t.id === tournament.id);
    if (index !== -1) {
        tournaments[index] = tournament;
        localStorage.setItem('sf6Tournaments', JSON.stringify(tournaments));
    }
}

// 生成决赛
function GenerateFinals(tournament) {
    if (!tournament.finals) {
        tournament.finals = [];
    }
    
    // 收集第二轮的小组第一和第二
    const secondRoundWinners = tournament.secondRoundGroups
        .filter(g => g.winner)
        .map(g => g.winner);
    
    const secondRoundRunnersUp = tournament.secondRoundGroups
        .filter(g => g.runnerUp)
        .map(g => g.runnerUp);
    
    // 合并所有决赛参赛者
    const finalsParticipants = [...secondRoundWinners, ...secondRoundRunnersUp].filter(p => p !== null);
    
    if (finalsParticipants.length < 2) {
        return; // 至少需要2人才能进行决赛
    }
    
    // 决赛采用单淘汰或小组赛，根据人数决定
    const participantCount = finalsParticipants.length;
    const shuffled = [...finalsParticipants].sort(() => Math.random() - 0.5);
    
    if (participantCount <= 8) {
        // 8人及以下：单淘汰赛
        const group = {
            id: 'finals_group_1',
            name: GetFinalsName(participantCount),
            participants: shuffled,
            matches: [],
            winner: null,
            runnerUp: null
        };
        
        // 生成单淘汰赛对阵
        GenerateEliminationMatches(group);
        tournament.finals.push(group);
    } else {
        // 9人以上：小组赛
        const groupSize = 4;
        const groupCount = Math.ceil(participantCount / groupSize);
        
        let currentIndex = 0;
        for (let i = 0; i < groupCount; i++) {
            const actualGroupSize = i < groupCount - 1 ? groupSize : (participantCount - currentIndex);
            const groupParticipants = shuffled.slice(currentIndex, currentIndex + actualGroupSize);
            currentIndex += actualGroupSize;
            
            if (groupParticipants.length < 2) continue;
            
            const group = {
                id: `finals_group_${i + 1}`,
                name: `${GetFinalsName(participantCount)} 第${i + 1}组`,
                participants: groupParticipants,
                matches: [],
                winner: null,
                runnerUp: null
            };
            
            GenerateGroupMatches(group);
            tournament.finals.push(group);
        }
    }
    
    // 保存锦标赛
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    const index = tournaments.findIndex(t => t.id === tournament.id);
    if (index !== -1) {
        tournaments[index] = tournament;
        localStorage.setItem('sf6Tournaments', JSON.stringify(tournaments));
    }
}

// 根据人数获取决赛名称
function GetFinalsName(participantCount) {
    if (participantCount <= 4) return '4强决赛';
    if (participantCount <= 8) return '8强决赛';
    if (participantCount <= 16) return '16强决赛';
    if (participantCount <= 32) return '32强决赛';
    return `${participantCount}强决赛`;
}

// 更新锦标赛标签页名称
function UpdateTournamentTabs(tournament) {
    if (!tournament || !tournament.participants) return;
    
    const participantCount = tournament.participants.length;
    const finalsName = GetFinalsName(participantCount);
    
    // 更新标签页
    const tabs = document.querySelectorAll('.tournament-tabs .tab-btn');
    tabs.forEach(tab => {
        const stage = tab.dataset.stage;
        if (stage === 'finals') {
            tab.textContent = `第四天：${finalsName}`;
        }
    });
}

// 生成单淘汰赛对阵
function GenerateEliminationMatches(group) {
    const participants = group.participants;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    // 确保人数是2的幂次方，不足则轮空
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
    let currentRoundParticipants = [...shuffled];
    
    while (currentRoundParticipants.length < nextPowerOf2) {
        currentRoundParticipants.push({ id: GenerateId(), name: '轮空', character: '', rank: '', bye: true });
    }
    
    // 生成第一轮比赛
    for (let i = 0; i < currentRoundParticipants.length / 2; i++) {
        const p1 = currentRoundParticipants[i];
        const p2 = currentRoundParticipants[currentRoundParticipants.length - 1 - i];
        
        if (p1.bye) {
            group.matches.push({
                id: GenerateId(),
                participant1: p1,
                participant2: p2,
                score1: 0,
                score2: 0,
                winner: p2,
                status: 'completed',
                byeMatch: true
            });
        } else if (p2.bye) {
            group.matches.push({
                id: GenerateId(),
                participant1: p1,
                participant2: p2,
                score1: 0,
                score2: 0,
                winner: p1,
                status: 'completed',
                byeMatch: true
            });
        } else {
            group.matches.push({
                id: GenerateId(),
                participant1: p1,
                participant2: p2,
                score1: 0,
                score2: 0,
                winner: null,
                status: 'pending'
            });
        }
    }
}

// 渲染第三天：第二轮
function RenderSecondRoundStage(tournament) {
    if (!tournament.secondRoundGroups || tournament.secondRoundGroups.length === 0) {
        bracketContent.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">需要先完成前两天的比赛</p>';
        return;
    }
    
    bracketContent.innerHTML = '';
    
    tournament.secondRoundGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'tournament-group';
        
        const totalMatches = group.matches.length;
        const completedMatches = group.matches.filter(m => m.status === 'completed').length;
        const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
        
        groupDiv.innerHTML = `
            <h3>${group.name} <span style="font-size: 0.8em; color: #666; font-weight: normal;">(${group.participants.length}人)</span></h3>
            <div class="group-progress" style="margin-bottom: 10px;">
                <div style="background: #e0e0e0; border-radius: 10px; height: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.85em; color: #666; margin-top: 5px;">进度：${completedMatches}/${totalMatches} 场 (${progress}%)</div>
            </div>
            <div class="group-participants">
                ${group.participants.map(p => `
                    <div class="participant-tag">${p.name} (${p.character})</div>
                `).join('')}
            </div>
            <div class="group-matches">
                <h4>对战表（BO3）</h4>
                ${group.matches.length === 0 ? '<p style="color: #999; text-align: center; padding: 10px;">暂无对战</p>' : group.matches.map(match => {
                    const statusClass = match.status === 'completed' ? 'completed' : match.status === 'in_progress' ? 'in_progress' : 'pending';
                    const statusText = match.status === 'completed' ? '已完成' : match.status === 'in_progress' ? '进行中' : '待开始';
                    const statusIcon = match.status === 'completed' ? '✓' : match.status === 'in_progress' ? '⚡' : '○';
                    const p1Winner = match.winner && match.winner.id === match.participant1.id;
                    const p2Winner = match.winner && match.winner.id === match.participant2.id;
                    return `
                    <div class="tournament-match-item ${statusClass}">
                        <div class="match-status-badge ${statusClass}">
                            <span class="status-icon">${statusIcon}</span>
                            <span class="status-text">${statusText}</span>
                        </div>
                        <div class="match-participants">
                            <div class="participant-card ${p1Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant1.name}</div>
                                <div class="participant-character">${match.participant1.character || ''}</div>
                            </div>
                            <div class="match-score-display">
                                <div class="score-large ${p1Winner ? 'winner-score' : ''}">${match.score1 || 0}</div>
                                <div class="score-divider">:</div>
                                <div class="score-large ${p2Winner ? 'winner-score' : ''}">${match.score2 || 0}</div>
                            </div>
                            <div class="participant-card ${p2Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant2.name}</div>
                                <div class="participant-character">${match.participant2.character || ''}</div>
                            </div>
                        </div>
                        <button class="btn-edit-match" onclick="EditTournamentMatch('${tournament.id}', '${group.id}', '${match.id}')" title="编辑比分">
                            <span class="edit-icon">✏️</span>
                            <span class="edit-text">编辑</span>
                        </button>
                    </div>
                `;
                }).join('')}
            </div>
            ${group.winner ? `<div class="group-result" style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 10px; border-radius: 8px; margin-top: 10px; font-weight: bold;">🥇 小组第一: ${group.winner.name}</div>` : ''}
            ${group.runnerUp ? `<div class="group-result" style="background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%); color: #333; padding: 10px; border-radius: 8px; margin-top: 5px; font-weight: bold;">🥈 小组第二: ${group.runnerUp.name}</div>` : ''}
        `;
        bracketContent.appendChild(groupDiv);
    });
}

// 渲染第四天：决赛
function RenderFinalsStage(tournament) {
    if (!tournament.finals || tournament.finals.length === 0) {
        bracketContent.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">需要先完成前三天的比赛</p>';
        return;
    }
    
    bracketContent.innerHTML = '';
    
    tournament.finals.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'tournament-group';
        
        const totalMatches = group.matches.length;
        const completedMatches = group.matches.filter(m => m.status === 'completed').length;
        const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
        
        groupDiv.innerHTML = `
            <h3>${group.name} <span style="font-size: 0.8em; color: #666; font-weight: normal;">(${group.participants.length}人)</span></h3>
            <div class="group-progress" style="margin-bottom: 10px;">
                <div style="background: #e0e0e0; border-radius: 10px; height: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #ffd700, #ff6b6b); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 0.85em; color: #666; margin-top: 5px;">进度：${completedMatches}/${totalMatches} 场 (${progress}%)</div>
            </div>
            <div class="group-participants">
                ${group.participants.map(p => `
                    <div class="participant-tag">${p.name} (${p.character})</div>
                `).join('')}
            </div>
            <div class="group-matches">
                <h4>对战表（BO3）</h4>
                ${group.matches.length === 0 ? '<p style="color: #999; text-align: center; padding: 10px;">暂无对战</p>' : group.matches.map(match => {
                    const statusClass = match.status === 'completed' ? 'completed' : match.status === 'in_progress' ? 'in_progress' : 'pending';
                    const statusText = match.status === 'completed' ? '已完成' : match.status === 'in_progress' ? '进行中' : '待开始';
                    const statusIcon = match.status === 'completed' ? '✓' : match.status === 'in_progress' ? '⚡' : '○';
                    const p1Winner = match.winner && match.winner.id === match.participant1.id;
                    const p2Winner = match.winner && match.winner.id === match.participant2.id;
                    const isBye = match.byeMatch;
                    return `
                    <div class="tournament-match-item ${statusClass}">
                        <div class="match-status-badge ${statusClass}">
                            <span class="status-icon">${statusIcon}</span>
                            <span class="status-text">${statusText}</span>
                        </div>
                        <div class="match-participants">
                            <div class="participant-card ${p1Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant1.name}</div>
                                <div class="participant-character">${match.participant1.character || ''}</div>
                            </div>
                            <div class="match-score-display">
                                <div class="score-large ${p1Winner ? 'winner-score' : ''}">${match.score1 || 0}</div>
                                <div class="score-divider">:</div>
                                <div class="score-large ${p2Winner ? 'winner-score' : ''}">${match.score2 || 0}</div>
                            </div>
                            <div class="participant-card ${p2Winner ? 'winner' : ''}">
                                <div class="participant-name">${match.participant2.name}</div>
                                <div class="participant-character">${match.participant2.character || ''}</div>
                            </div>
                        </div>
                        ${!isBye ? `<button class="btn-edit-match" onclick="EditTournamentMatch('${tournament.id}', '${group.id}', '${match.id}')" title="编辑比分">
                            <span class="edit-icon">✏️</span>
                            <span class="edit-text">编辑</span>
                        </button>` : '<span style="color: #999; font-size: 0.9em;">轮空</span>'}
                    </div>
                `;
                }).join('')}
            </div>
            ${group.winner ? `<div class="group-result" style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 10px; border-radius: 8px; margin-top: 10px; font-weight: bold;">🏆 冠军: ${group.winner.name}</div>` : ''}
            ${group.runnerUp ? `<div class="group-result" style="background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%); color: #333; padding: 10px; border-radius: 8px; margin-top: 5px; font-weight: bold;">🥈 亚军: ${group.runnerUp.name}</div>` : ''}
        `;
        bracketContent.appendChild(groupDiv);
    });
}

// 编辑锦标赛比赛（确保在全局作用域）
window.EditTournamentMatch = function(tournamentId, groupId, matchId) {
    let tournaments = [];
    const savedTournaments = localStorage.getItem('sf6Tournaments');
    if (savedTournaments) {
        tournaments = JSON.parse(savedTournaments);
    }
    
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    // 查找小组（可能在groups、losersGroups、secondRoundGroups或finals中）
    let group = tournament.groups.find(g => g.id === groupId);
    if (!group && tournament.losersGroups) {
        group = tournament.losersGroups.find(g => g.id === groupId);
    }
    if (!group && tournament.secondRoundGroups) {
        group = tournament.secondRoundGroups.find(g => g.id === groupId);
    }
    if (!group && tournament.finals) {
        group = tournament.finals.find(g => g.id === groupId);
    }
    if (!group) return;
    
    const match = group.matches.find(m => m.id === matchId);
    if (!match) return;
    
    // 显示比分输入
    const resultDisplay = document.getElementById('resultDisplay');
    const currentScore1 = match.score1 || 0;
    const currentScore2 = match.score2 || 0;
    const isCompleted = match.status === 'completed';
    const isInProgress = match.status === 'in_progress';
    
    resultDisplay.innerHTML = `
        <div class="edit-match-header">
            <h3>编辑比赛比分</h3>
            <div class="match-preview">
                <div class="preview-participant ${match.winner && match.winner.id === match.participant1.id ? 'preview-winner' : ''}">
                    <div class="preview-name">${match.participant1.name}</div>
                    <div class="preview-character">${match.participant1.character || ''}</div>
                </div>
                <div class="preview-vs">VS</div>
                <div class="preview-participant ${match.winner && match.winner.id === match.participant2.id ? 'preview-winner' : ''}">
                    <div class="preview-name">${match.participant2.name}</div>
                    <div class="preview-character">${match.participant2.character || ''}</div>
                </div>
            </div>
        </div>
        
        <div class="score-edit-section">
            <p class="rule-hint">📋 个人赛规则：BO3（三局两胜，先赢2局者获胜）</p>
            ${isInProgress && (currentScore1 > 0 || currentScore2 > 0) ? `
                <div class="current-score-display">
                    <span class="current-label">当前比分：</span>
                    <span class="current-score">${currentScore1} - ${currentScore2}</span>
                </div>
            ` : ''}
            
            <div class="score-input-grid">
                <div class="score-input-card">
                    <label class="score-label">${match.participant1.name}</label>
                    <div class="score-input-wrapper">
                        <button class="score-btn score-minus" onclick="AdjustScore('score1', -1)">−</button>
                        <input type="number" id="score1" min="0" max="2" value="${currentScore1}" class="score-input-number" onchange="ValidateScore()">
                        <button class="score-btn score-plus" onclick="AdjustScore('score1', 1)">+</button>
                    </div>
                    <div class="score-hint">(0-2局)</div>
                </div>
                
                <div class="score-divider-large">:</div>
                
                <div class="score-input-card">
                    <label class="score-label">${match.participant2.name}</label>
                    <div class="score-input-wrapper">
                        <button class="score-btn score-minus" onclick="AdjustScore('score2', -1)">−</button>
                        <input type="number" id="score2" min="0" max="2" value="${currentScore2}" class="score-input-number" onchange="ValidateScore()">
                        <button class="score-btn score-plus" onclick="AdjustScore('score2', 1)">+</button>
                    </div>
                    <div class="score-hint">(0-2局)</div>
                </div>
            </div>
            
            <div id="scoreValidation" class="score-validation"></div>
            
            ${isCompleted ? `
                <div class="match-completed-notice">
                    <span class="notice-icon">✓</span>
                    <span>比赛已完成，${match.winner ? match.winner.name : '未知'}获胜</span>
                </div>
            ` : ''}
        </div>
    `;
    
    matchResultModal.dataset.tournamentId = tournamentId;
    matchResultModal.dataset.groupId = groupId;
    matchResultModal.dataset.matchId = matchId;
    matchResultModal.dataset.matchType = 'tournament';
    matchResultModal.classList.add('show');
};

// 调整比分（全局函数）
window.AdjustScore = function(scoreId, delta) {
    const input = document.getElementById(scoreId);
    if (!input) return;
    
    let currentValue = parseInt(input.value) || 0;
    let newValue = currentValue + delta;
    
    // 限制在0-2之间
    if (newValue < 0) newValue = 0;
    if (newValue > 2) newValue = 2;
    
    input.value = newValue;
    ValidateScore();
};

// 验证比分（全局函数）
window.ValidateScore = function() {
    const validation = document.getElementById('scoreValidation');
    if (!validation) return;
    
    const score1 = parseInt(document.getElementById('score1').value) || 0;
    const score2 = parseInt(document.getElementById('score2').value) || 0;
    
    validation.classList.remove('show');
    validation.textContent = '';
    
    // BO3验证
    if (score1 < 0 || score2 < 0) {
        validation.textContent = '比分不能为负数！';
        validation.classList.add('show');
        return false;
    }
    if (score1 > 2 || score2 > 2) {
        validation.textContent = '单方获胜局数不能超过2局！';
        validation.classList.add('show');
        return false;
    }
    if (score1 === 2 && score2 === 2) {
        validation.textContent = '双方不能同时达到2局，请检查比分！';
        validation.classList.add('show');
        return false;
    }
    if (score1 + score2 > 3) {
        validation.textContent = '总局数不能超过3局！';
        validation.classList.add('show');
        return false;
    }
    if (score1 < 2 && score2 < 2 && score1 + score2 === 3) {
        validation.textContent = '比赛未结束，总局数不能为3！';
        validation.classList.add('show');
        return false;
    }
    
    return true;
};
// 初始化时根据模式显示/隐藏区域
function UpdateModeDisplay() {
    if (currentMatchMode === 'individual') {
        individualSection.style.display = 'block';
        memberPoolSection.style.display = 'none';
        teamsContainer.style.display = 'none';
    } else {
        individualSection.style.display = 'none';
        memberPoolSection.style.display = 'block';
        teamsContainer.style.display = 'grid';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', Init);

