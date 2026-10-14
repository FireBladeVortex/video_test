
// YouTube Player iframe API 준비
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"
// document.head.appendChild(api)

let api_준비_대기 = null
const api_준비 = new Promise(resolve => { api_준비_대기 = resolve })

let player = null
// iframe 호출할 때
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
			// 자막 한글 + pip 모드 제작 대비
			// cc_lang_pref: "ko",
			// 자막 자동 실행 + pip 모드 제작 대비
			// cc_load_policy: 1,
		},

		// 현재 상태 불러오기
		events:
		{
			onReady: () =>
			{
				player.setVolume(+볼륨_조절.value)
				api_준비_대기
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


function 재생_표시줄()
{
	const 지금_시간 = player.getCurrentTime()
	const 비율 = (지금_시간 - 시작_시간) / (종료_시간 - 시작_시간)
	document.getElementById("재생_시간_지금").style.width = (Math.max(0, Math.min(1, 비율)) * 100) + "%"

	// const [, 지금_문자열] = 시간_표기법(지금_시간)
	// if (종료_문자열 && 시작_문자열)
	// {
	// 	if (시작_시간 === 0)
	// 	{
	// 		document.getElementById("플레이어_메세지").textContent = 지금_문자열 + "<" + 종료_문자열
	// 	}
	// 	else
	// 	{
	// 		document.getElementById("플레이어_메세지").textContent = 시작_문자열 + "< + 지금_문자열 + ">" + 종료_문자열
	// 	}
	// }
}


async function 불러오기_제목(id)
{
	const 주소_1 = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v="
	const 주소_2 = id
	const 주소_3 = "&format=json"
	const 주소 = 주소_1 + 주소_2 + 주소_3
	try
	{
		const 호출 = await fetch(주소)
		const 데이터 = await 호출.json()

		채널_이름 = 데이터.author_name
		채널_주소 = 데이터.author_url
		동영상_제목 = 데이터.title
		// document.title = 채널_이름

		if (arguments.length !== 1)
			return

		document.getElementById("플레이어_메세지").style.textAlign = "start"
		document.getElementById("플레이어_메세지").textContent = 동영상_제목
	}
	catch
	{
	}
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

// 동영상 상태 변화 감지에서 사용할 재생 표시줄 변수
let 재생_시간_표시줄 = null
// 동영상 상태가 변하면 즉시 작동
function onPlayerStateChange(event)
{

	if (event.data === 5 && 재생목록_대기)
	{
		재생목록_대기()
		재생목록_대기 = null
		return
	}

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
			불러오기_제목(선택한_동영상_id, title)
		}
		else
		{
			불러오기_제목(선택한_동영상_id)
		}
	}

	if (event.data === 1)
	{
		if (player.getCurrentTime() < 시작_시간)
		{
			player.seekTo(시작_시간, true)
		}
		clearInterval(재생_시간_표시줄)
		재생_시간_표시줄 = setInterval(재생_표시줄, 100)
	}
	else
	{
		clearInterval(재생_시간_표시줄)
	}

	if (event.data === 0)
	{
		player.seekTo(시작_시간, true)
		player.playVideo()
	}

	const 상태 = [1, 2, 3].includes(event.data)
	// ("#오른쪽, #클릭_방지") // #클릭_방지 개선 방법 찾기전까지 막음
	const 오른쪽 = document.querySelectorAll("#오른쪽")
	for (const 화면 of 오른쪽)
	{
		화면.style.cursor = 상태 ? "pointer" : "default"
		화면.onclick = 상태 ? 재생_일시중지_조작 : null
	}
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



const 볼륨 = document.getElementById("볼륨")
const 볼륨_조절 = document.getElementById("볼륨_조절")

const 조절_반영 = () => player.setVolume(+볼륨_조절.value)
볼륨_조절.addEventListener("input", 조절_반영)

const 방지 = 간섭 => 간섭.stopPropagation()
볼륨.addEventListener("mousedown", 방지)
볼륨.addEventListener("click", 방지)



function 키_입력(키)
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

	if (!player || !재생중())
		return

	// 키 반복입력 방지
	if (!키.repeat)
	{
		if (키.code === "Space")
		{
			키.preventDefault()
			재생_일시중지_조작()
		}
		else if (키.code === "ArrowLeft")
		{
			키.preventDefault()
			player.seekTo(Math.max(시작_시간, player.getCurrentTime() - 5), true)
		}
		else if (키.code === "ArrowRight")
		{
			키.preventDefault()
			player.seekTo(Math.min(종료_시간, player.getCurrentTime() + 5), true)
		}
		// 숫자키 0-9 = 현재 재생 위치 변경
		else if (키.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			키.preventDefault()
			const 비율 = +(키.code.slice(-1)) / 10
			const 숫자키 = 시작_시간 + Math.floor((종료_시간 - 시작_시간) * 비율)
			player.seekTo(숫자키, true)
		}

		// 재생 속도 조절 보류
		// else if (컨트롤_쉬프트 && 증가 || 감소)
		// {
		// 	키.preventDefault()
		// 	const 증감 = 증가 ? 0.05 : -0.05
		// 	const 제한 = 증가 ? 2 : 0.25
		// 	const 최대최소  = 증가 ? Math.min : Math.max
		// 	player.setPlaybackRate(최대최소(제한, (player.getPlaybackRate() + 증감)))
		// }
		// else if (키.code === "Numpad0")
		// {
		// 	키.preventDefault()
		// 	player.setPlaybackRate(1)
		// }
	}
}
document.addEventListener("keydown", 키_입력)



// 마우스 휠로 소리 크기 조절 및 오작동 방지
function 드르륵(마우스휠)
{
	마우스휠.preventDefault()
	소리_크기_값_조절(마우스휠.deltaY < 0 ? +5 : -5)
}
document.addEventListener("wheel", 드르륵, { passive: false })



///////////////////////////////////////////////////////////////////////////////////////////////////



































































































const 이거_몇칸임 = { 동영상: 0, 쇼츠: 0 }



function 크기_감지(구역)
{
	function 페이지_초기화(종류)
	{
		if (종류 === "쇼츠")
		{
			페이지_쇼츠 = 1
		}
		else
		{
			페이지_동영상 = 1
		}
		채우기_페이지_버튼(종류)
	}

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

	for (const 목록 of 구역)
	{
		const 종류 = 목록.target.classList.contains("쇼츠") ? "쇼츠" : "동영상"
		이거_몇칸임[종류] = 크기_계산(목록)

		페이지_초기화(종류)
		페이지_재구성(종류)
	}
}
const 재구성 = new ResizeObserver(크기_감지)



function 페이지_재구성(종류)
{
	const 숫자 = 이거_몇칸임[종류]
	if (!숫자)
		return

	const 페이지_지금 = 종류 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
	const 숫자_최소 = (페이지_지금 - 1) * 숫자
	const 숫자_최대 = (페이지_지금 * 숫자) - 1

	const 그거 = document.querySelectorAll(".버튼[data-종류=" + 종류 + "]")
	for (const 버튼 of 그거)
	{
		const 번호 = +버튼.dataset.숫자
		const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
		버튼.style.display = 몇번 ? "" : "none"

	}
}



function 페이지_최대(종류)
{
	const 숫자 = 이거_몇칸임[종류]
	const data = 사용할_동영상[종류] ?? 임시_목록[종류]
	return Math.ceil(data.length / 숫자)
}



function 채우기_페이지_버튼(종류)
{
	const 버튼_이전 = document.querySelector(".버튼_이전[data-종류=" + 종류 + "]")
	const 버튼_지금 = document.querySelector(".버튼_지금[data-종류=" + 종류 + "]")
	const 버튼_다음 = document.querySelector(".버튼_다음[data-종류=" + 종류 + "]")

	if (!버튼_이전 || !버튼_지금 || !버튼_다음)
		return

	const 버튼_이전_문자열 = 버튼_이전.querySelector(".문자열_클릭")
	const 버튼_다음_문자열 = 버튼_다음.querySelector(".문자열_클릭")

	const 페이지_수 = 페이지_최대(종류)

	if (페이지_수 <= 1)
	{
		버튼_이전_문자열.textContent = ""
		버튼_지금.textContent = ""
		버튼_다음_문자열.textContent = ""
		return
	}

	const 페이지_지금 = 종류 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상

	버튼_이전_문자열.textContent = 페이지_지금 === 1 ? "" : "이전"
	버튼_지금.textContent = ""
	버튼_다음_문자열.textContent = 페이지_지금 >= 페이지_수 ? "" : "다음"

	const 이전_숫자 = document.createElement("div")
	이전_숫자.className = "이전_숫자"
	이전_숫자.dataset.종류 = 종류
	이전_숫자.textContent = 페이지_지금 === 1 ? "" : 페이지_지금 - 1
	버튼_지금.appendChild(이전_숫자)

	const 지금_숫자 = document.createElement("div")
	지금_숫자.className = "지금_숫자"
	지금_숫자.dataset.종류 = 종류
	지금_숫자.textContent = 페이지_지금
	버튼_지금.appendChild(지금_숫자)

	const 다음_숫자 = document.createElement("div")
	다음_숫자.className = "다음_숫자"
	다음_숫자.dataset.종류 = 종류
	다음_숫자.textContent = 페이지_지금 + 1 > 페이지_수 ? "" : 페이지_지금 + 1
	버튼_지금.appendChild(다음_숫자)
}



// 시간 표시 변환
// 100000초 또는 12:34:56 같은 모양으로
// 없는거 채워서 시간값 2개 전달하기
function 시간_표기법(시간)
{
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
	if (typeof 시간 === "string")
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
}



const 사용할_동영상 = { 동영상: null, 쇼츠: null}

let 시작_시간 = null
let 종료_시간 = null

let 시작_문자열 = null
let 종료_문자열 = null

let 선택한_동영상_id = null
let 채널_이름 = null
let 동영상_제목 = null
let 채널_주소 = null

let 페이지_동영상 = 1
let 페이지_쇼츠 = 1

function 선택한_동영상_준비(id, start = 0, end = 0)
{
	선택한_동영상_id = id

	if (arguments.length === 1)
		return 선택한_동영상_id

	const 시작 = 시간_표기법(start)
	시작_시간 = 시작[0]
	시작_문자열 = 시작[1]

	const 종료 = 시간_표기법(end)
	종료_시간 = 종료[0]
	종료_문자열 = 종료[1]

	player.cueVideoById(
	{
		videoId : 선택한_동영상_id,
		startSeconds : 시작_시간,
		...(종료_시간 > 0 && {endSeconds : 종료_시간})
	})

}



let 이미지_클릭 = null
function 이미지_클릭_강조(종류)
{
	const 딸깍 = document.querySelectorAll(".버튼")
	for (const 버튼 of 딸깍)
	{
		const 그거 = (버튼.dataset.종류 + (버튼.dataset.숫자 + "").padStart(3, "0"))
		const 클릭 = 그거 === 종류
		버튼.classList.toggle("강조", 클릭)
		버튼.classList.toggle("발기", !클릭)

	}
	이미지_클릭 = 종류
}



function 채우기_페이지(종류)
{
	const 페이지 = document.querySelector(".페이지." + 종류)
	if (!페이지)
		return

	const data = 사용할_동영상[종류] ?? 임시_목록[종류]
	if (!data)
		return

	const crrt_data_count = 페이지.children.length
	const nxxt_data_count = data.length

	// const next_count = 이거_몇칸임[종류] 새로 계산된 필요 개수
	for (let 숫자 = 0 ; 숫자 < data.length ; 숫자++)
	// for (let 숫자 = 0 ; data.length ; 숫자++)
	{
		const ready = data[숫자]
		if (!ready)
			continue

		const 버튼 = document.createElement("button")
		버튼.className = "버튼"
		버튼.dataset.숫자 = 숫자
		버튼.dataset.종류 = 종류

		const img = document.createElement("img")
		const src_1 = "https://img.youtube.com/vi/"
		const src_2 = ready.id
		const src_3 = "/mqdefault.jpg"
		img.src = src_1 + src_2 + src_3

		버튼.appendChild(img)
		페이지.appendChild(버튼)

		function 딸깍()
		{
			const 그거 = (종류 + (숫자 + "").padStart(3, "0"))
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
				const 쇼츠 = 종류 === "쇼츠"
				선택한_동영상_준비(ready.id, 쇼츠 ? 0 : ready.start, 쇼츠 ? 0 : ready.end)
			}
		}
		버튼.addEventListener("click", 딸깍)
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

	채우기_페이지("동영상")

	페이지_동영상 = 1
	채우기_페이지_버튼("동영상")
	페이지_재구성("동영상")
}



let 구역_종류 = null
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

	왼쪽.style.gridTemplateRows = [비율.동영상, 비율.쇼츠, 비율.부분].join(" ")

	구역_종류 = 조절_딸깍

	const 이거 = document.querySelectorAll(".머리말_크기 .문자열_클릭")
	for (const 크기 of 이거)
	{
		크기.textContent = 크기.dataset.종류 === 구역_종류 ? "작게" : "크게"
	}
}



function 유효_재확인(종류)
{
	return Array.isArray(종류) && 종류.some(동영상 => 동영상.id)
}



function 만들기_페이지_버튼()
{
	function 팔락(한장)
	{
		const 페이지_마지막 = 페이지_최대(분류.종류)
		const 페이지_지금 = 분류.종류 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
		const 넘기기 = 페이지_지금 + 한장

		if (넘기기 < 1 || 넘기기 > 페이지_마지막)
			return

		if (분류.종류 === "쇼츠")
		{
			페이지_쇼츠 = 넘기기
		}
		else
		{
			페이지_동영상 = 넘기기
		}
		채우기_페이지_버튼(분류.종류)
		페이지_재구성(분류.종류)
	}

	const 버튼_이전 = document.createElement("button")
	버튼_이전.className = "버튼_이전"
	버튼_이전.dataset.종류 = 분류.종류
	머리말_페이지.appendChild(버튼_이전)

		const 버튼_이전_문자열 = document.createElement("span")
		버튼_이전_문자열.className = "문자열_클릭"
		버튼_이전.appendChild(버튼_이전_문자열)
		버튼_이전_문자열.addEventListener("click", () => 팔락(-1))

	const 버튼_지금 = document.createElement("span")
	버튼_지금.className = "버튼_지금"
	버튼_지금.dataset.종류 = 분류.종류
	머리말_페이지.appendChild(버튼_지금)

	const 버튼_다음 = document.createElement("button")
	버튼_다음.className = "버튼_다음"
	버튼_다음.dataset.종류 = 분류.종류
	머리말_페이지.appendChild(버튼_다음)

		const 버튼_다음_문자열 = document.createElement("span")
		버튼_다음_문자열.className = "문자열_클릭"
		버튼_다음.appendChild(버튼_다음_문자열)
		버튼_다음_문자열.addEventListener("click", () => 팔락(+1))
}



function 만들기_종류_구분(원곡, 커버)
{
	if (유효_재확인(원곡) && 유효_재확인(커버))
	{
		const 종류_모두 = document.createElement("button")
		종류_모두.className = "종류_모두"
		머리말_종류.appendChild(종류_모두)

			const 문자열_모두 = document.createElement("span")
			문자열_모두.className = "문자열_클릭"
			문자열_모두.textContent = "모두"
			종류_모두.appendChild(문자열_모두)
			문자열_모두.addEventListener("click", () => 미리보기_교체(동영상))

		const 종류_원곡 = document.createElement("button")
		종류_원곡.className = "종류_원곡"
		머리말_종류.appendChild(종류_원곡)

			const 문자열_원곡 = document.createElement("span")
			문자열_원곡.className = "문자열_클릭"
			문자열_원곡.textContent = "원곡"
			종류_원곡.appendChild(문자열_원곡)
			문자열_원곡.addEventListener("click", () => 미리보기_교체(원곡))

		const 종류_커버 = document.createElement("button")
		종류_커버.className = "종류_커버"
		머리말_종류.appendChild(종류_커버)

			const 문자열_커버 = document.createElement("span")
			문자열_커버.className = "문자열_클릭"
			문자열_커버.textContent = "커버"
			종류_커버.appendChild(문자열_커버)
			문자열_커버.addEventListener("click", () => 미리보기_교체(커버))
	}
}



function 만들기_기초(왼쪽)
{
	const 구역 = document.createElement("section")
	구역.className = "구역"
	구역.dataset.종류 = 분류.종류
	왼쪽.appendChild(구역)

	const 머리말 = document.createElement("header")
	구역.appendChild(머리말)

		const 머리말_재생목록 = document.createElement("span")
		머리말_재생목록.className = "머리말_재생목록"
		머리말_재생목록.textContent = 분류.종류 + " 재생 목록"
		머리말.appendChild(머리말_재생목록)

		const 머리말_종류 = document.createElement("menu")
		머리말_종류.className = "머리말_종류"
		머리말.appendChild(머리말_종류)

		const 머리말_페이지 = document.createElement("menu")
		머리말_페이지.className = "머리말_페이지"
		머리말.appendChild(머리말_페이지)

		const 머리말_크기 = document.createElement("button")
		머리말_크기.className = "머리말_크기"
		머리말.appendChild(머리말_크기)

			const 크기_조절_문자열 = document.createElement("span")
			크기_조절_문자열.className = "문자열_클릭"
			크기_조절_문자열.textContent = "크게"
			크기_조절_문자열.dataset.종류 = 분류.종류
			머리말_크기.appendChild(크기_조절_문자열)
			크기_조절_문자열.addEventListener("click", () => 크기_조절(왼쪽, 분류.종류))
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

	for (const 분류 of 종류_확인)
	{
		if (!유효_재확인(분류.자료))
			continue

		사용할_동영상[분류.종류] = 분류.자료

		만들기_기초(왼쪽)

		if (분류.종류 === "부분")
		{
			// 만들기_부분()
			continue
		}

		if (분류.종류 === "동영상")
		{
			만들기_종류_구분(원곡, 커버)
		}

		만들기_페이지_버튼()
		채우기_페이지_버튼(분류.종류)

		// 미리보기 들어갈 공간
		const 목록 = document.createElement("section")
		목록.className = "목록 " + 분류.종류
		구역.appendChild(목록)

		// list 크기를 가로 세로 썸네일 크기 배수 구해서 총 몇칸인지 구하고 page로 넘겨
		const 페이지 = document.createElement("div")
		페이지.className = "페이지 " + 분류.종류
		목록.appendChild(페이지)

		채우기_페이지(분류.종류)
	}
}



function 만들기_구역()
{
	만들기_목록()

	const 목록 = document.querySelectorAll(".목록")
	for (const 감지 of 목록)
	{
		재구성.observe(감지)
	}
}



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




async function id_가공(재생목록)
{
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
				// return id_재생목록
				return

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



	const keys = Object.keys(재생목록)

	for (const key of keys)
	{
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



function 불러오기_재생목록(이름)
{
	const script = document.createElement("script")
	script.src = "명단/" + 이름 + ".js"

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

	// 준비 되었을때 실행
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
	script.addEventListener("load", async () =>
	{
		// api 실행
		document.head.appendChild(api)
		await api_준비
		await id_가공(window.재생목록)

		나만의_색깔(window.재생목록.색깔)

		만들기_구역()

		await 불러오기_소개(임시_목록.소개)

		document.getElementById("왼쪽_이름").remove()
		document.getElementById("오른쪽_안내").remove()
	})
	document.head.appendChild(script)
}






function 채우기_이름표들(왼쪽_이름)
{
	const 본문 = document.createElement("section")
	본문.className = "본문"
	왼쪽_이름.appendChild(본문)

	const 이름표들 = document.createElement("menu")
	이름표들.className = "이름표들"
	본문.appendChild(이름표들)

	function 가나다순_정렬(목록)
	{
		const 규칙 = new Intl.Collator("ko")
		const 정렬 = [...목록].sort((앞, 뒤) =>
		{
			const 비교 = 규칙.compare(앞.이름.trim(), 뒤.이름.trim())
			return 비교
		})

		const map = new Map()
		for (const 그거 of 정렬)
		{
			const 이거 = 그거.이름.trim()
			if (map.has(이거))
			{
				map.get(이거).중복 = true
			}
			else
			{
				map.set(이거, { ...그거 })
			}
		}

		const 결과 = [...map.values()]

		return 결과
	}

	const 이름들 = 가나다순_정렬(이름_목록)
	for (const 누구 of 이름들)
	{
		const 이름표 = document.createElement("button")
		이름표.className = "이름표"
		이름표들.appendChild(이름표)

		const 이름 = document.createElement("span")
		이름.className = 누구.이름
		이름.textContent = 누구.중복 ? 누구.이름 + "*" : 누구.이름
		이름표.appendChild(이름)

		function 불러오는중(본문)
		{
			const 불러오는_중 = document.createElement("div")
			불러오는_중.id = "불러오는중"
			불러오는_중.textContent = "불러오는 중"
			불러오는_중.style.flex = "1"
			불러오는_중.style.display = "flex"
			불러오는_중.style.alignItems = "center"
			불러오는_중.style.justifyContent = "center"
			불러오는_중.style.fontSize = "60px"
			본문.appendChild(불러오는_중)
		}

		이름.addEventListener("click", () =>
		{
			본문.innerHTML = ""
			불러오는중(본문)
			불러오기_재생목록(누구.이름)
		})
	}
}



const 가나다순 =
[
	"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
	"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
]

function 채우기_가나다()
{
	const 가나다 = document.getElementById("가나다")

	for (const 순서대로 of 가나다순)
	{
		const 자음_상자 = document.createElement("button")
		자음_상자.className = "자음_상자"
		가나다.appendChild(자음_상자)

			const 자음 = document.createElement("span")
			자음.className = 순서대로
			자음.textContent = 순서대로
			자음_상자.appendChild(자음)

		const 자음_번호 = document.createElement("button")
		자음_번호.className = "자음_번호"
		가나다.appendChild(자음_번호)

			const 몇개 = document.createElement("span")
			몇개.className = 순서대로
			// 몇개.textContent = 순서대로
			자음_번호.appendChild(몇개)

	}
}



function 시작()
{
	채우기_가나다()

	const 왼쪽_이름 = document.getElementById("왼쪽_이름")
	채우기_이름표들(왼쪽_이름)

	// 채우기_안내목록() 함수 제작 필요
	// 채우기_안내문()
}
시작()