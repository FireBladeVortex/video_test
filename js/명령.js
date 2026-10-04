
// YouTube Player iframe API 준비
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
// document.head.appendChild(api)

let api_준비_끝 = null
const api_준비 = new Promise(resolve => { api_준비_끝 = resolve })

function 불러오기_api()
{
	document.head.appendChild(api)
	return api_준비
}



// iframe 들어갈 변수 준비
let player = null
let 재생_대기 = null

// iframe 호출한다면
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("YTP",
	{
		width: "100%",
		height: "100%",
		videoId: "",
		playerVars:
		{
			// 다음 자동재생 방지
			autoplay: 0,
			// 영상 종료 때 추천 방지
			rel: 0,
			// 풀 스크린 버튼 숨김
			// fs: 0,
			// 유튜브 자체 키보드 조작 기능 방지 방향키 숫자 0~9 등
			disablekb: 1,
			// 유튜브 일부 ui 숨김
			// controls: 0,
			// 자막 한글 pip 모드 제작 대비
			// cc_lang_pref: "ko",
			// 자막 자동 실행 pip 모드 제작 대비
			// cc_load_policy: 1,
		},

		// 현재 상태 불러오기
		events:
		{
			onReady: () =>
			{
				// 현재 value 적용
				player.setVolume(+볼륨_조절.value)
				api_준비_끝()
			},
			onError : () =>
			{
				if (재생목록_대기)
				{
					재생목록_대기()
					재생목록_대기 = null
				}
			},
			onStateChange : onPlayerStateChange,
		}
	})
}



///////////////////////////////////////////////////////////////////////////////////////////////////


// 재생 진행 비율 계산 및 시간 표시
function ctrl_view()
{
	// 지금 재생 중인 동영상 시간 확인
	const cur = player.getCurrentTime()
	const ratio = (cur - 시작_시간) / (종료_시간 - 시작_시간)
	document.getElementById("재생_시간_지금").style.width = Math.max(0, Math.min(1, ratio)) * 100 + "%"

	// const [, msg_cur] = 시간_표기법(cur)
	// if (종료_문자열 && 시작_문자열)
	// {
	// 	if (시작_시간 === 0)
	// 	{
	// 		document.getElementById("플레이어_메세지").textContent = msg_cur + "<" + 종료_문자열
	// 	}
	// 	else
	// 	{
	// 		document.getElementById("플레이어_메세지").textContent = 시작_문자열 + "< + msg_cur + ">" + 종료_문자열
	// 	}
	// }
}


// 이름 제목
async function 불러오기_제목(id) // 값 실적용 대신 뱉어내는 방식으로 변경
{
	const 주소_1 = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v="
	const 주소_2 = id
	const 주소_3 = "&format=json"
	const url = 주소_1 + 주소_2 + 주소_3
	try
	{
		const input = await fetch(url)
		const data = await input.json()

		set_name = data.author_name
		set_ch = data.author_url
		set_title = data.title
		document.title = set_name

		if (arguments.length !== 1)
			return

		document.getElementById("플레이어_메세지").style.textAlign = "start"
		document.getElementById("플레이어_메세지").textContent = set_title
	}
	catch
	{
	}
}


// 영상 상태 확인
// YT.PlayerState.ENDED = 0
// YT.PlayerState.PLAYING = 1
// YT.PlayerState.PAUSED = 2
// YT.PlayerState.BUFFERING = 3
// YT.PlayerState.CUED = 5

// 상태 변화 감지에서 사용할 재생 표시줄 변수
let 재생_시간_표시줄 = null

// 동영상 상태가 변화하면 즉시 작동
function onPlayerStateChange(event)
{

	if (event.data === 5 && 재생목록_대기)
	{
		재생목록_대기()
		재생목록_대기 = null
		return
	}

	// 영상 정보 불러온 상태(재생 시작 전)
	if (event.data === 5)
	{
		player.setPlaybackRate(1)
		if (종료_시간 === 0)
		{
			[종료_시간, 종료_문자열] = 시간_표기법(player.getDuration())
		}
		let title = null
		try
		{
			title = player.getVideoData().title
		}
		catch
		{
		}
		if (title)
		{
			document.getElementById("플레이어_메세지").style.textAlign = "start"
			document.getElementById("플레이어_메세지").textContent = title
			불러오기_제목(set_id, title)
		}
		else
		{
			불러오기_제목(set_id)
		}
	}
	// 재생 중일 때 100ms마다 진행바 갱신
	if (event.data === 1)
	{
		if (player.getCurrentTime() < 시작_시간)
		{
			player.seekTo(시작_시간, true)
		}
		clearInterval(재생_시간_표시줄) // 인터벌 중복 호출 방지
		재생_시간_표시줄 = setInterval(ctrl_view, 100)
	}
	else
	{
		clearInterval(재생_시간_표시줄)
	}
	// 영상 재시작
	if (event.data === 0)
	{
		player.seekTo(시작_시간, true)
		player.playVideo()
	}
	//
	const 상태 = [1, 2, 3].includes(event.data)
	// ("#오른쪽, #클릭_방지") // #클릭_방지 임시 중지 사용자 선택으로 버튼 만들기 전까지
	document.querySelectorAll("#오른쪽").forEach(화면 =>
	{
		화면.style.cursor = 상태 ? "pointer" : "default"
		화면.onclick = 상태 ? 재생_일시중지_조작 : null
	})
	// document.getElementById("클릭_방지").style.pointerEvents = 상태 ? "auto" : "none"
}



// 만들기 보류
function 재생_속도_조절(키, 증감)
{
}



function 소리_크기_값_조절(증감)
{
	const 지금소리크기 = player.getVolume()
	const 올려내려 = 증감 > 0
		? Math.floor(지금소리크기 / 5) * 5 + 5
		: Math.ceil(지금소리크기 / 5) * 5 - 5
	const 범위 = Math.min(100, Math.max(0, 올려내려))
	player.setVolume(범위)
	볼륨_조절.value = 범위
}


// 재생 종료
// YT.PlayerState.ENDED === 0
// 재생 중
// YT.PlayerState.PLAYING === 1
// 재생 일시 중지
// YT.PlayerState.PAUSED === 2
// 재생 하기위한 준비 중
// YT.PlayerState.BUFFERING === 3
// 재생 하기위한 준비 완료
// YT.PlayerState.CUED === 5

const 재생 = () => player?.getPlayerState?.() === YT.PlayerState.PLAYING
const 일시중지 = () => player?.getPlayerState?.() === YT.PlayerState.PAUSED
// !재생중() === !재생() && !일시중지()
const 재생중 = () => 재생() || 일시중지()



function 재생_일시중지_조작()
{
	if (재생())
	{
		player.pauseVideo()
	}
	else if (일시중지())
	{
		player.playVideo()
	}
}



const 볼륨 = document.getElementById("볼륨")
const 볼륨_조절 = document.getElementById("볼륨_조절")



// 소리 크기 조절 막대 값 반영 시키기
볼륨_조절.addEventListener("input", () =>
{
	player.setVolume(+볼륨_조절.value)
})



const 방지 = 간섭 => 간섭.stopPropagation()
볼륨.addEventListener("mousedown", 방지)
볼륨.addEventListener("click", 방지)



// 해당하는 키 입력 기본 작동을 무시
// 스페이스 바가 play_or_pause()를 실행
// 숫자 패드 컨트롤 또는 쉬프트 +-로 재생 속도 조절 (보류)
// 숫자 패드 +-로 소리 크기 조절
document.addEventListener("keydown", 키 =>
{
	const 증가 = 키.code === "NumpadAdd" || 키.code === "ArrowUp"
	const 감소 = 키.code === "NumpadSubtract" || 키.code === "ArrowDown"
	// const 컨트롤_쉬프트 = 키.ctrlKey || 키.shiftKey

	// if (!컨트롤_쉬프트)
	// {
		// + 키를 누르면 소리 크게
		if (증가)
		{
			키.preventDefault()
			소리_크기_값_조절(+5)
		}
		// - 키를 누르면 소리 작게
		else if (감소)
		{
			키.preventDefault()
			소리_크기_값_조절(-5)
		}
	// }
	// else if (컨트롤_쉬프트 && 증가 || 감소)
	// {
	// 	키.preventDefault()
	// }

	// 준비안됐으면 작동 중지
	if (!player || !재생중())
		return

	// 키 반복입력 방지
	if (!키.repeat)
	{
		// 스페이스바 = 재생, 일시중지
		if (키.code === "Space")
		{
			키.preventDefault()
			재생_일시중지_조작()
		}

		// 방향키 왼쪽 = 5초 전으로
		else if (키.code === "ArrowLeft")
		{
			키.preventDefault()
			player.seekTo(Math.max(시작_시간, player.getCurrentTime() - 5), true) // 시작_시간 보다 작아질 수 없음
		}

		// 방향키 오른쪽 = 5초 앞으로
		else if (키.code === "ArrowRight")
		{
			키.preventDefault()
			player.seekTo(Math.min(종료_시간, player.getCurrentTime() + 5), true) // 종료_시간 보다 커질 수 없음
		}

		// 숫자키 0-9 = 현재 재생 위치 변경
		else if (키.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			키.preventDefault()
			const 비율 = +(키.code.slice(-1)) / 10
			const 숫자키 = 시작_시간 + Math.floor((종료_시간 - 시작_시간) * 비율)
			player.seekTo(숫자키, true)
		}

		// 재생 속도 조절
		else if (컨트롤_쉬프트 && 증가 || 감소)
		{
			키.preventDefault()
			const 증감 = 증가 ? 0.05 : -0.05
			const 제한 = 증가 ? 2 : 0.25
			const 최대최소  = 증가 ? Math.min : Math.max
			player.setPlaybackRate(최대최소(제한, (player.getPlaybackRate() + 증감)))
		}
		else if (키.code === "Numpad0")
		{
			키.preventDefault()
			player.setPlaybackRate(1)
		}
	}
})



// 마우스 휠로 소리 크기 조절 및 오작동 방지
document.addEventListener("wheel", 마우스휠 =>
{
	마우스휠.preventDefault()
	소리_크기_값_조절(마우스휠.deltaY < 0 ? +5 : -5)
},
{
	passive: false
})





///////////////////////////////////////////////////////////////////////////////////////////////////


















// 소개 데이터 재생 준비 (추가) - 재생목록이면 cuePlaylist(랜덤), 일반 동영상이면 cueVideoById
function 불러오기_소개(소개)
{
	if (!소개)
		return

	const 무작위 = 소개[Math.floor(Math.random() * 소개.length)]

	player.cueVideoById(
	{
		videoId : 무작위.id,
	})

}


function 페이지_초기화(이거)
{
	if (이거 === "쇼츠")
		페이지_쇼츠 = 1
	else
		페이지_동영상 = 1

	버튼_설정(이거)
}


// 미리보기 몇개 들어가는지 계산
function 크기_계산(목록)
{
	const 설정 = getComputedStyle(document.documentElement)
	const 가로값 = parseInt(설정.getPropertyValue("--가로"))
	const 세로값 = parseInt(설정.getPropertyValue("--세로"))

	const 쇼츠 = 목록.target.classList.contains("쇼츠")

	const 쇼츠_가로 = 쇼츠 ? 세로값 : 가로값
	const 쇼츠_세로 = 쇼츠 ? 가로값 : 세로값

	const 너비 = 목록.contentBoxSize[0].inlineSize
	const 높이 = 목록.contentBoxSize[0].blockSize

	const 가로 = Math.floor(너비 / 쇼츠_가로)
	const 세로 = Math.floor(높이 / 쇼츠_세로)
	const 몇칸 = 가로 * 세로

	return 몇칸
}


// 크기 계산
const 이거_몇칸임 = { 동영상: 0, 쇼츠: 0 }
const 재구성 = new ResizeObserver(구역 =>
{
	구역.forEach(목록 =>
	{
		const 종류 = 목록.target.classList.contains("쇼츠") ? "쇼츠" : "동영상"
		이거_몇칸임[종류] = 크기_계산(목록)

		페이지_초기화(종류)
		페이지_재구성(종류)
	})
})

// multiple 값에 맞는 범위만 썸네일 표시/숨김
function 페이지_재구성(이거)
{
	const 숫자 = 이거_몇칸임[이거]
	if (!숫자)
		return

	const multiple = 이거 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
	const 숫자_최소 = (multiple - 1) * 숫자
	const 숫자_최대 = (multiple * 숫자) - 1

	document.querySelectorAll(".버튼[data-종류=" + 이거 + "]").forEach(버튼 =>
	{
		const 번호 = +버튼.dataset.숫자
		const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
		버튼.style.display = 몇번 ? "" : "none"
	})
}



// 마지막 페이지 번호 계산 공통 함수
function 페이지_최대(이거)
{
	const 숫자 = 이거_몇칸임[이거]
	const data = 사용할_동영상[이거] ?? 임시_목록[이거]
	return Math.ceil(data.length / 숫자)
}

// 이전/중앙/다음 버튼 영역을 상태에 맞게 다시 그리는 공통 함수
function 버튼_설정(이거)
{
	const 버튼_이전 = document.querySelector(".버튼_이전[data-종류=" + 이거 + "]")
	const 버튼_지금 = document.querySelector(".버튼_지금[data-종류=" + 이거 + "]")
	const 버튼_다음 = document.querySelector(".버튼_다음[data-종류=" + 이거 + "]")

	if (!버튼_이전 || !버튼_지금 || !버튼_다음)
		return

	const 버튼_이전_문자열 = 버튼_이전.querySelector(".문자열_클릭")
	const 버튼_다음_문자열 = 버튼_다음.querySelector(".문자열_클릭")

	const 페이지_수 = 페이지_최대(이거)

	if (페이지_수 <= 1)
	{
		버튼_이전_문자열.textContent = ""
		버튼_지금.textContent = ""
		버튼_다음_문자열.textContent = ""
		return
	}

	const multiple = 이거 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상

	버튼_이전_문자열.textContent = multiple === 1 ? "" : "이전"
	버튼_지금.textContent = ""
	버튼_다음_문자열.textContent = multiple >= 페이지_수 ? "" : "다음"

	const 이전_숫자 = document.createElement("div")
	이전_숫자.className = "이전_숫자"
	이전_숫자.dataset.종류 = 이거
	이전_숫자.textContent = multiple === 1 ? "" : multiple - 1
	버튼_지금.appendChild(이전_숫자)

	const 지금_숫자 = document.createElement("div")
	지금_숫자.className = "지금_숫자"
	지금_숫자.dataset.종류 = 이거
	지금_숫자.textContent = multiple
	버튼_지금.appendChild(지금_숫자)

	const 다음_숫자 = document.createElement("div")
	다음_숫자.className = "다음_숫자"
	다음_숫자.dataset.종류 = 이거
	다음_숫자.textContent = multiple + 1 > 페이지_수 ? "" : multiple + 1
	버튼_지금.appendChild(다음_숫자)
}



// 시간 메세지 표기법 정리 24:00:00
function 시분초_표준(시분초)
{
	const 시간_길이 = 시분초.findIndex(값 => 값 !== 0)
	const 시간_길이_확인 = 시간_길이 === -1 ? 시분초.length - 1 : 시간_길이
	const 시간_정리 = 시분초.slice(시간_길이_확인)
	const 시간_변환 = 시간_정리.map((값, 순서) => 순서 === 0 ? (값 + "") : (값 + "").padStart(2,"0"))
	const 결과 = 시간_변환.join(":")
	return 결과
}




// 시간 표시 변환
// 100000초 또는 12:34:56 같은 모양으로
// 없는거 채워서 시간값 2개 전달하기
function 시간_표기법(시간)
{
	// 숫자 모양인 시간 값이 들어왔을 떄
	if (typeof 시간 === "number" && 시간 > 0)
	{
		const 표준시간 = new Date(시간 * 1000)
		const 시 = 표준시간.getUTCHours()
		const 분 = 표준시간.getUTCMinutes()
		const 초 = 표준시간.getUTCSeconds()
		const 시간_숫자 = 시간
		const 시간_문자 = 시분초_표준([시, 분, 초])
		return [ 시간_숫자, 시간_문자 ]
	}
	// 문자열 모양 시간 값이 들어왔을 때
	else if (typeof 시간 === "string")
	{
		const 오타확인 = 시간.replace(/;/g, ":")
		const 재확인 = 오타확인.includes(":")
		if (재확인)
		{
			const 시분초 = 오타확인.split(":")
			const 초 = +(시분초.pop())
			const 분 = 시분초.length ? +(시분초.pop()) : 0
			const 시 = 시분초.length ? +(시분초.pop()) : 0
			const 시간_숫자 = 시 * 3600 + 분 * 60 + 초
			const 시간_문자 = 시분초_표준([시, 분, 초])
			return [ 시간_숫자, 시간_문자 ]
		}
	}
	else
	{
		return [ 0, 0 ]
	}
}



// 현재 표시중인 목록 데이터
let 사용할_동영상 = { 동영상: null, 쇼츠: null }



// 시간 관리
let 시작_시간 = null
let 종료_시간 = null

// 시간 메세지
let 시작_문자열 = null
let 종료_문자열 = null

// 정보 관리
let set_id = null
let set_name = null
let set_title = null
let set_ch = null


let 페이지_동영상 = 1
let 페이지_쇼츠 = 1

// youtube 정보 가져오기 cue 상태 되기전
function ready_data(id, start = 0, end = 0)
{
	const get_id = id

	if (arguments.length === 1)
		return get_id

	// 클릭 시 id 저장
	set_id = id

	const 시작 = 시간_표기법(start)
	시작_시간 = 시작[0]
	시작_문자열 = 시작[1]

	// 종료 시간 결정(getDuration() 아님)
	const 종료 = 시간_표기법(end)
	종료_시간 = 종료[0]
	종료_문자열 = 종료[1]

	// 영상 불러오기
	player.cueVideoById(
	{
		videoId : get_id,
		startSeconds : 시작_시간,
		...(종료_시간 > 0 && {endSeconds : 종료_시간})
	})

}


let 이미지_클릭 = null
function 이미지_클릭_강조(이거)
{
	// 활성화 버튼 강조 나머지 버튼 어둡게
	document.querySelectorAll(".버튼").forEach(버튼 =>
	{
		const 그거 = (버튼.dataset.종류 + (버튼.dataset.숫자 + "").padStart(3, "0"))
		const 클릭 = 그거 === 이거
		버튼.classList.toggle("강조", 클릭)
		버튼.classList.toggle("발기", !클릭)
	})
	// total_list에서 클릭한 썸네일 또 클릭할때 쓰는 장치
	이미지_클릭 = 이거
}


// 이거_몇칸임 값에 맞춰 썸네일 버튼을 (재)생성하는 함수
function 페이지_채우기(이거)
{
	const 페이지 = document.querySelector(".페이지." + 이거)
	if (!페이지)
		return

	const data = 사용할_동영상[이거] ?? 임시_목록[이거]
	if (!data)
		return

	const crrt_data_count = 페이지.children.length
	const nxxt_data_count = data.length

	// const next_count = 이거_몇칸임[이거] 새로 계산된 필요 개수

	for (let 숫자 = 0; data.length; 숫자++)
	{
		const ready = data[숫자]
		if (!ready) break

		const 버튼 = document.createElement("button")
		버튼.className = "버튼"
		버튼.dataset.숫자 = 숫자
		버튼.dataset.종류 = 이거

		const img = document.createElement("img")
		const src_1 = "https://img.youtube.com/vi/"
		const src_2 = ready.id
		const src_3 = "/mqdefault.jpg"
		img.src = src_1 + src_2 + src_3

		버튼.appendChild(img)
		페이지.appendChild(버튼)

		버튼.addEventListener("click", () =>
		{
			const 그거 = (이거 + (숫자 + "").padStart(3, "0"))
			if (이미지_클릭 === 그거)
			{
				// if (재생())
				// {
				// 	player.pauseVideo()
				// }
				// else if (일시중지())
				// {
				// 	player.playVideo()
				// }
				// else
					return
			}
			else
			{
				이미지_클릭_강조(그거)
				const 쇼츠 = 이거 === "쇼츠"
				ready_data(ready.id, 쇼츠 ? 0 : ready.start, 쇼츠 ? 0 : ready.end)
			}
		})
	}
}



// 모두/원곡/커버 클릭 시 표시할 video 데이터 교체
function 미리보기_교체(next_data)
{
	사용할_동영상.동영상 = next_data // 현재 데이터 갱신

	const 페이지 = document.querySelector(".페이지.동영상")
	if (페이지)
	{
		페이지.innerHTML = ""
	}

	페이지_채우기("동영상")

	페이지_동영상 = 1
	버튼_설정("동영상")
	페이지_재구성("동영상")
}


let 구역_종류 = null // 현재 확대된 섹션 타입 저장
// (수정) 재생 목록 칸 확대/축소 전환 (토글 방식)
function 크기_조절(왼쪽, 그거)
{
	const 비율 = { 동영상: "2fr", 쇼츠: "2fr", 부분: "1fr" }

	const 조절_딸깍 = 구역_종류 === 그거 ? null : 그거

	if (조절_딸깍)
	{
		비율.동영상 = 그거 === "동영상" ? "1fr" : "0fr"
		비율.쇼츠 = 그거 === "쇼츠" ? "1fr" : "0fr"
		비율.부분 = 그거 === "부분" ? "1fr" : "0fr"
	}

	const 공백 = " "
	왼쪽.style.gridTemplateRows = 비율.동영상 + 공백 + 비율.쇼츠 + 공백 + 비율.부분

	구역_종류 = 조절_딸깍

	document.querySelectorAll(".h1_크기 .문자열_클릭").forEach(span =>
	{
		span.textContent = span.dataset.종류 === 구역_종류 ? "작게" : "크게"
	})
}


// id 값이 실제로 채워진 배열인지 확인 (추가)
function 유효_재확인(종류)
{
	return Array.isArray(종류) && 종류.some(동영상 => 동영상.id)
}




function 만들기_목록()
{

	const 왼쪽 = document.getElementById("왼쪽")

	const 원곡 = 임시_목록.원곡 ?? []
	const 커버 = 임시_목록.커버 ?? []
	const 동영상 = 원곡.concat(커버)

	const 쇼츠 = 임시_목록.쇼츠 ?? []
	const 부분 = 임시_목록.부분 ?? []

	const 종류_확인 =
	[
		{
			종류 : "동영상",
			자료 : 동영상
		},
		{
			종류 : "쇼츠",
			자료 : 쇼츠
		},
		{
			종류 : "부분",
			자료 : 부분
		},
	]

	종류_확인.forEach(분류 =>
	{
		if (!유효_재확인(분류.자료))
			return

		사용할_동영상[분류.종류] = 분류.자료

		const 구역 = document.createElement("div")
		구역.className = "구역"
		구역.dataset.종류 = 분류.종류
		왼쪽.appendChild(구역)

		const h1 = document.createElement("h1")
		구역.appendChild(h1)

			const 구역_재생목록 = document.createElement("div")
			구역_재생목록.className = "구역_재생목록"
			구역_재생목록.textContent = 분류.종류 + " 재생 목록"
			h1.appendChild(구역_재생목록)

			const h1_종류 = document.createElement("div")
			h1_종류.className = "h1_종류"
			h1.appendChild(h1_종류)

			const h1_페이지 = document.createElement("div")
			h1_페이지.className = "h1_페이지"
			h1.appendChild(h1_페이지)

			const h1_크기 = document.createElement("div")
			h1_크기.className = "h1_크기"
			h1.appendChild(h1_크기)

				const 크기_조절_문자열 = document.createElement("span")
				크기_조절_문자열.className = "문자열_클릭"
				크기_조절_문자열.textContent = "크게"
				크기_조절_문자열.dataset.종류 = 분류.종류
				h1_크기.appendChild(크기_조절_문자열)
				크기_조절_문자열.addEventListener("click", () => 크기_조절(왼쪽, 분류.종류))

		if (분류.종류 === "부분")
		{
			make_long()
			return
		}

		if (분류.종류 === "동영상")
		{
			if (유효_재확인(원곡) && 유효_재확인(커버))
			{
				const h1_모두 = document.createElement("div")
				h1_모두.className = "h1_모두"
				h1_종류.appendChild(h1_모두)

					const 문자열_모두 = document.createElement("span")
					문자열_모두.className = "문자열_클릭"
					문자열_모두.textContent = "모두"
					h1_모두.appendChild(문자열_모두)
					문자열_모두.addEventListener("click", () => 미리보기_교체(동영상))

				const h1_원곡 = document.createElement("div")
				h1_원곡.className = "h1_원곡"
				h1_종류.appendChild(h1_원곡)

					const 문자열_원곡 = document.createElement("span")
					문자열_원곡.className = "문자열_클릭"
					문자열_원곡.textContent = "원곡"
					h1_원곡.appendChild(문자열_원곡)
					문자열_원곡.addEventListener("click", () => 미리보기_교체(원곡))

				const h1_커버 = document.createElement("div")
				h1_커버.className = "h1_커버"
				h1_종류.appendChild(h1_커버)

					const 문자열_커버 = document.createElement("span")
					문자열_커버.className = "문자열_클릭"
					문자열_커버.textContent = "커버"
					h1_커버.appendChild(문자열_커버)
					문자열_커버.addEventListener("click", () => 미리보기_교체(커버))
			}
		}

		const 버튼_이전 = document.createElement("div")
		버튼_이전.className = "버튼_이전"
		버튼_이전.dataset.종류 = 분류.종류
		h1_페이지.appendChild(버튼_이전)

			const 버튼_이전_문자열 = document.createElement("span")
			버튼_이전_문자열.className = "문자열_클릭"
			버튼_이전.appendChild(버튼_이전_문자열)
			버튼_이전_문자열.addEventListener("click", () =>
			{
				if (분류.종류 === "쇼츠")
					페이지_쇼츠 = Math.max(1, 페이지_쇼츠 - 1)
				else
					페이지_동영상 = Math.max(1, 페이지_동영상 - 1)
				버튼_설정(분류.종류)
				페이지_재구성(분류.종류)
			})

		const 버튼_지금 = document.createElement("div")
		버튼_지금.className = "버튼_지금"
		버튼_지금.dataset.종류 = 분류.종류
		h1_페이지.appendChild(버튼_지금)

		const 버튼_다음 = document.createElement("div")
		버튼_다음.className = "버튼_다음"
		버튼_다음.dataset.종류 = 분류.종류
		h1_페이지.appendChild(버튼_다음)

			const 버튼_다음_문자열 = document.createElement("span")
			버튼_다음_문자열.className = "문자열_클릭"
			버튼_다음.appendChild(버튼_다음_문자열)
			버튼_다음_문자열.addEventListener("click", () =>
			{
				const 페이지_마지막 = 페이지_최대(분류.종류)
				const multiple = 분류.종류 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
				if (multiple >= 페이지_마지막)
					return

				if (분류.종류 === "쇼츠")
				{
					페이지_쇼츠 = 페이지_쇼츠 + 1
				}
				else
				{
					페이지_동영상 = 페이지_동영상 + 1
				}
				버튼_설정(분류.종류)
				페이지_재구성(분류.종류)
			})

		버튼_설정(분류.종류)


		// const h1_크기 = document.createElement("div")
		// h1_크기.className = "h1_크기"
		// h1.appendChild(h1_크기)

		// 	const 크기_조절 = document.createElement("span")
		// 	크기_조절.className = "문자열_클릭"
		// 	크기_조절.textContent = "크게"
		// 	크기_조절.dataset.종류 = 분류.종류
		// 	h1_크기.appendChild(크기_조절)
		// 	크기_조절.addEventListener("click", () => 크기_조절(분류.종류))

		// 미리보기 들어갈 공간
		const 목록 = document.createElement("div")
		목록.className = "목록 " + 분류.종류
		구역.appendChild(목록)

		// list 크기를 가로 세로 썸네일 크기 배수 구해서 총 몇칸인지 구하고 page로 넘겨
		const 페이지 = document.createElement("div")
		페이지.className = "페이지 " + 분류.종류
		목록.appendChild(페이지)

		페이지_채우기(분류.종류)
	})

}




// 스위치 클릭 시 실제 초기화 실행 (추가)
function 만들기_구역()
{
	만들기_목록()

	// 크기 관찰 시작
	document.querySelectorAll(".목록").forEach(목록 => 재구성.observe(목록))
}





// 색상 변경
function 나만의_색깔(색깔)
{
	if (!색깔)
		return

	const 설정 = document.documentElement.style

	if (색깔.오른쪽바탕색)
		설정.setProperty("--오른쪽바탕색", 색깔.오른쪽바탕색)
	if (색깔.왼쪽바탕색)
		설정.setProperty("--왼쪽바탕색", 색깔.왼쪽바탕색)
	if (색깔.강조1)
		설정.setProperty("--강조1", 색깔.강조1)
	if (색깔.강조2)
		설정.setProperty("--강조2", 색깔.강조2)
	if (색깔.강조3)
		설정.setProperty("--강조3", 색깔.강조3)
}


let 재생목록_대기 = null
async function 재생목록_조사(id)
{
	const 대기 = new Promise(resolve => { 재생목록_대기 = resolve })
	const 시간초과 = new Promise(resolve => setTimeout(resolve, 5000))

	player.cuePlaylist(
	{
		listType: "playlist",
		list: id
	})

	await Promise.race([대기, 시간초과])
	재생목록_대기 = null

	const 재생목록 = player.getPlaylist() ?? []
	const 결과 = 재생목록.map(id => ({ id }))
	return 결과
}



function 재생목록인가(id)
{
	return id.startsWith("PL")
}



function id_찾기(주소)
{
	// 잘못된 것을 받아왔을 때 에러 방지를 위한 try
	try
	{
		// 유효한 링크인지 확인
		const url = new URL(주소)

		// 해당 링크가 재생목록인지 확인
		const id_재생목록 = url.searchParams.get("list")
		// 재생목록이 맞고 PL 타입 재생목록인지 확인하고 맞으면 값을 전달
		if (id_재생목록 && 재생목록인가(id_재생목록))
			return id_재생목록

		// 해당 링크가 동영상 링크인지 확인
		// 링크 모양에 따라 경우의 수 대비
		const v = url.searchParams.get("v")
		const path = url.pathname.split("/").pop()
		const id_동영상 = v ?? path

		// 잘못된 링크인지 대비
		const 정규표현식 = /^[a-zA-Z0-9_-]{11}$/
		// 잘못됐다면 아무것도 안하고 즉시 null 전달
		if (!정규표현식.test(id_동영상))
			return null

		// 동영상 시작시간을 포함하고있는지 확인
		const t = parseInt(url.searchParams.get("t"))
		// 포함하고 있으면 시간도 같이 전달 아니라면 id만 전달 + NaN 방지
		return (Number.isNaN(t)) ? id_동영상 : [id_동영상, t]
	}
	// try 과정에서 뭔가 잘못됐다면 즉시 멈추고 null 전달
	catch
	{
		return null
	}
}




async function id_가공(재생목록)
{
	const keys = Object.keys(재생목록)

	for (const key of keys)
	{
		// 불필요한 호출 방지 및 대비
		if (!Array.isArray(재생목록[key]))
			continue

		for (const 동영상 of 재생목록[key])
		{
			const id = id_찾기(동영상.id)
			const 값 = Array.isArray(id) ? id[0] : id
			if (값)
			{
				if (재생목록인가(값))
				{
					const 결과 = await 재생목록_조사(값)
					임시_목록[key] = (임시_목록[key] ?? []).concat(결과)
				}
				else
				{
					const { id, ...rest } = 동영상
					임시_목록[key] = (임시_목록[key] ?? []).concat([{ id: 값, ...rest }])
				}
			}
		}
	}
}


function 불러오기_재생목록(누구)
{
	const script = document.createElement("script")
	script.src = "명단/" + 누구.이름 + ".js"



	const api_준비 = 불러오기_api()
	// 준비 되었을때 실행
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
	script.addEventListener("load", async () =>
	{
		await api_준비
		await id_가공(window.재생목록)

		나만의_색깔(window.재생목록.색깔)

		만들기_구역()

		await 불러오기_소개(임시_목록.소개)

		document.getElementById("이름_상자").remove()
		document.getElementById("안내_상자").remove()
	})

	document.head.appendChild(script)
}




function 가나다순_정렬(목록)
{
	const 규칙 = new Intl.Collator("ko")
	const 정렬 = [...목록].sort((앞, 뒤) =>
	{
		const 비교 = 규칙.compare(앞.이름.trim(), 뒤.이름.trim())
		return 비교
	})

	const map = new Map()
	정렬.forEach(이거 =>
	{
		const 그거 = 이거.이름.trim()
		if (map.has(그거))
		{
			map.get(그거).중복 = true
		}
		else
		{
			map.set(그거, { ...이거 })
		}
	})

	const 결과 = [...map.values()]

	return 결과
}




function 만들기_이름표들(이름_상자)
{
	const 이름표_목록 = document.createElement("div")
	이름표_목록.className = "이름표_목록"
	이름_상자.appendChild(이름표_목록)

	가나다순_정렬(이름_목록).forEach(누구 =>
	{
		const 이름표 = document.createElement("div")
		이름표.className = "이름표"

		이름표.textContent = 누구.중복 ? 누구.이름 + "*" : 누구.이름
		이름표_목록.appendChild(이름표)

		이름표.addEventListener("click", () =>
		{
			이름_상자.innerHTML = ""
			이름_상자.textContent = "불러오는 중"
			불러오기_재생목록(누구)
		})
	})
}



function 만들기_가나다(이름_상자)
{
	const h1 = document.createElement("h1")
	이름_상자.appendChild(h1)

	const 가나다 = document.createElement("div")
	가나다.className = "가나다"
	h1.appendChild(가나다)

	const 가나다순 =
	[
		"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
		"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
	]

	가나다순.forEach(가나다_순서대로 =>
	{
		const 자음_상자 = document.createElement("span")
		자음_상자.className = "자음_상자"
		자음_상자.textContent = 가나다_순서대로
		가나다.appendChild(자음_상자)

		const 자음_번호 = document.createElement("span")
		자음_번호.className = "자음_번호"
		가나다.appendChild(자음_번호)
	})
}


function render_switch()
{
	const 이름_상자 = document.getElementById("이름_상자")

	만들기_가나다(이름_상자)
	만들기_이름표들(이름_상자)
}

render_switch()