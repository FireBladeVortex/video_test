
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"


let api_준비_대기 = null
const api_준비 = new Promise(resolve => { api_준비_대기 = resolve })

let player = null
function onYouTubeIframeAPIReady()
{
	player = new YT.Player("YTP",
	{
		width : "100%",
		height : "100%",
		videoId : "",
		playerVars :
		{
			// 다음 자동재생 방지
			autoplay : 0,
			// 영상 종료 때 추천 방지
			rel : 0,
			// 풀 스크린 버튼 숨김
			// fs : 0,
			// 유튜브 자체 키보드 조작 기능 방지 방향키 숫자 0~9 등
			disablekb : 1,
			// 유튜브 일부 ui 숨김
			// controls : 0,
			// 자막 한글 + pip 모드 제작 대비
			// cc_lang_pref : "ko",
			// 자막 자동 실행 + pip 모드 제작 대비
			// cc_load_policy : 1,
		},
		events :
		{
			onReady : () =>
			{
				api_준비_대기()
				player.setVolume(+볼륨_조절.value)
			},
			onStateChange : onPlayerStateChange,
		}
	})
}



let 재생_시간_표시줄 = null
function onPlayerStateChange(event)
{
	if (event.data === 5)
	{
		player.setPlaybackRate(1)
		if (시간_관리.종료 === 0)
		{
			[시간_관리.종료, 문자열_관리.종료] = 시간_표기법(player.getDuration())
		}

		let title = null
		try
		{
			title = player.getVideoData().title
		}
		catch {}

		if (title)
		{
			동영상_제목.style.textAlign = "start"
			제목표시줄.textContent = title
		}
		else
		{
			불러오기_제목(선택한_동영상.id)
		}
	}

	if (event.data === 1)
	{
		if (player.getCurrentTime() < 시간_관리.시작)
		{
			player.seekTo(시간_관리.시작, true)
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
		player.seekTo(시간_관리.시작, true)
		player.playVideo()
	}

	const 상태 = [1, 2, 3].includes(event.data)
	오른쪽.style.cursor = 상태 ? "pointer" : "default"
	오른쪽.onclick = 상태 ? 재생_일시중지_조작 : null
}



///////////////////////////////////////////////////////////////////////////////////////////////////

const 왼쪽 = document.getElementById("왼쪽")
const 오른쪽 = document.getElementById("오른쪽")
const 왼쪽_이름 = document.getElementById("왼쪽_이름")
const 오른쪽_안내 = document.getElementById("오른쪽_안내")
const 동영상_제목 = document.getElementById("동영상_제목")
const 제목표시줄 = document.getElementById("제목표시줄")
let 구역들 = null



///////////////////////////////////////////////////////////////////////////////////////////////////


const 조각모음 = document.createDocumentFragment()
function 조각모음_초기화()
{
	if (조각모음.hasChildNodes())
		조각모음.replaceChildren()
}

function 만들기_공간(모양, 소속, 클래스, 문자열, 종류, 숫자)
{
	const 공간 = document.createElement(모양)

	if (클래스)
		공간.className = 클래스

	if (문자열)
		공간.textContent = 문자열

	if (종류)
		공간.dataset.종류 = 종류

	if (숫자)
		공간.dataset.숫자 = 숫자

	if (소속)
		소속.appendChild(공간)

	return 공간
}

function 구역_찾기(종류)
{
	return 왼쪽.querySelector(".구역[data-종류=" + 종류 + "]")
}


const 재생_시간_지금 = document.getElementById("재생_시간_지금")
function 재생_표시줄()
{
	const 지금_시간 = player.getCurrentTime()
	const 비율 = (지금_시간 - 시간_관리.시작) / (시간_관리.종료 - 시간_관리.시작)
	재생_시간_지금.style.width = (Math.max(0, Math.min(1, 비율)) * 100) + "%"

	// const [, 지금_문자열] = 시간_표기법(지금_시간)
	// if (문자열_관리.종료 && 문자열_관리.시작)
	// {
	// 	if (시간_관리.시작 === 0)
	// 	{
	// 		동영상_제목.textContent = 지금_문자열 + "<" + 문자열_관리.종료
	// 	}
	// 	else
	// 	{
	// 		동영상_제목.textContent = 문자열_관리.시작 + "< + 지금_문자열 + ">" + 문자열_관리.종료
	// 	}
	// }
}


async function 불러오기_제목(id)
{
	if (arguments.length !== 1)
		return

	const 주소_1 = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v="
	const 주소_2 = id
	const 주소_3 = "&format=json"
	const 주소 = 주소_1 + 주소_2 + 주소_3

	try
	{
		const 호출 = await fetch(주소)
		const 데이터 = await 호출.json()

		선택한_채널.이름 = 데이터.author_name
		선택한_채널.주소 = 데이터.author_url
		선택한_동영상.제목 = 데이터.title
		// document.title = 선택한_채널.이름

		동영상_제목.style.textAlign = "start"
		제목표시줄.textContent = 선택한_동영상.제목
	}
	catch {}
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


// 만들기 보류
function 재생_속도_조절(키, 증감)
{

}



function 소리_크기_조절(증감)
{
	const 범위 = Math.min(100, Math.max(0, Math[증감 > 0 ? "floor" : "ceil"](player.getVolume() / 5) * 5 + 증감))
	player.setVolume(범위)
	볼륨_조절.value = 범위
}



const 볼륨 = document.getElementById("볼륨")
const 볼륨_조절 = document.getElementById("볼륨_조절")

볼륨_조절.addEventListener("input", () => player.setVolume(+볼륨_조절.value))

const 방지 = 간섭 => 간섭.stopPropagation()
볼륨.addEventListener("mousedown", 방지)
볼륨.addEventListener("click", 방지)



function 키_입력(키)
{
	if (!player || !재생중())
		return

	// const 증가 = 키.code === "NumpadAdd" || 키.code === "ArrowUp"
	// const 감소 = 키.code === "NumpadSubtract" || 키.code === "ArrowDown"
	const 증감 = (키.code === "NumpadAdd" || 키.code === "ArrowUp")
		- (키.code === "NumpadSubtract" || 키.code === "ArrowDown")
	const 시간이동 = (키.code === "ArrowRight") - (키.code === "ArrowLeft")
	// const 컨트롤_쉬프트 = 키.ctrlKey || 키.shiftKey

	// 키 반복입력 방지
	if (!키.repeat)
	{
		if (증감)
		{
			키.preventDefault()
			소리_크기_조절(증감 * 5)
		}
		else if (키.code === "Space")
		{
			키.preventDefault()
			재생_일시중지_조작()
		}
		else if (시간이동)
		{
			키.preventDefault()
			player.seekTo(Math.min(시간_관리.종료, Math.max(시간_관리.시작, player.getCurrentTime() + 시간이동 * 5)), true)
		}
		// 숫자키 0-9 = 현재 재생 위치 변경
		else if (키.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			키.preventDefault()
			const 비율 = +(키.code.slice(-1)) / 10
			const 숫자키 = 시간_관리.시작 + Math.floor((시간_관리.종료 - 시간_관리.시작) * 비율)
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



function 드르륵(마우스휠)
{
	마우스휠.preventDefault()

	const 오른쪽 = 마우스휠.target.closest("#오른쪽")
	if (오른쪽)
	{
		마우스휠.preventDefault()
		소리_크기_조절(마우스휠.deltaY < 0 ? +5 : -5)
		return
	}

	const 크기_계산 = 마우스휠.target.closest(".크기_계산")
	if (크기_계산)
	{
		마우스휠.preventDefault()
		페이지_넘기기(크기_계산.closest(".구역").dataset.종류, 마우스휠.deltaY > 0 ? +1 : -1)
		return
	}
}
document.addEventListener("wheel", 드르륵, { passive : false })


document.getElementById("처음으로").addEventListener("click", () => location.reload())


///////////////////////////////////////////////////////////////////////////////////////////////////



// 시간 표시 변환
// 100000초 또는 12:34:56 같은 모양으로
// 없는거 채워서 시간값 2개 전달하기
function 시간_표기법(시간)
{
	if (!시간 || 시간 <= 0)
		return [ 0, 0 ]

	const 값 =
		typeof 시간 === "number"
		? 시간
		: (typeof 시간 === "string" && /[.,:;]/.test(시간))
			? 시간.split(/[.,:;]/).reduce((합, 값) => 합 * 60 + +값, 0)
			: 0

	if (!(값 > 0))
		return [ 0, 0 ]

	const 시 = Math.floor(값 / 3600)
	const 분 = Math.floor(값 % 3600 / 60)
	const 초 = Math.floor(값 % 60)
	const 시분초 = [시, 분, 초]


	const 길이 = 시분초.findIndex(값 => 값 !== 0)
	const [처음, ...나머지] = 시분초.slice(길이 === -1 ? 시분초.length - 1 : 길이)
	const 문자열 = [처음, ...나머지.map(값 => String(값).padStart(2, "0"))].join(":")

	return [ 값, 문자열 ]
}


///////////////////////////////////////////////////////////////////////////////////////////////////






































































function 페이지_넘기기(종류, 한장)
{
	const 페이지_마지막 = 페이지_최대(종류)
	const 넘기기 = 페이지_관리[종류] + 한장

	if (넘기기 < 1 || 넘기기 > 페이지_마지막)
		return

	페이지_관리[종류] = 넘기기
	페이지_갱신(종류)
}





const 이거_몇칸임 = { 동영상 : 0, 쇼츠 : 0, 부분 : 0 }
const 설정 = getComputedStyle(document.documentElement)
const 길이 =
{
	가로 : parseInt(설정.getPropertyValue("--가로")),
	세로 : parseInt(설정.getPropertyValue("--세로")),
}
let 총몇칸 = null
function 크기_감지(구역)
{
	for (const 목록 of 구역)
	{
		const 쇼츠 = 목록.target.classList.contains("쇼츠")
		const 부분 = 목록.target.classList.contains("부분")
		const 종류 = 쇼츠 ? "쇼츠" : 부분 ? "부분" : "동영상"

		if (부분)
		{
			const 세로_몇칸 = Math.floor((목록.contentBoxSize[0].blockSize + 3) / 33)
			총몇칸 = 세로_몇칸
		}
		else
		{
			const 쇼츠_가로 = 쇼츠 ? 길이.세로 : 길이.가로
			const 쇼츠_세로 = 쇼츠 ? 길이.가로 : 길이.세로

			const 너비 = 목록.contentBoxSize[0].inlineSize
			const 높이 = 목록.contentBoxSize[0].blockSize

			const 가로 = Math.floor(너비 / 쇼츠_가로)
			const 세로 = Math.floor(높이 / 쇼츠_세로)
			const 몇칸 = 가로 * 세로

			총몇칸 = 몇칸
		}

		if (이거_몇칸임[종류] === 총몇칸)
			continue

		이거_몇칸임[종류] = 총몇칸
		페이지_관리[종류] = 1
		페이지_갱신(종류)
	}
}
const 재구성 = new ResizeObserver(크기_감지)



function 페이지_최대(종류)
{
	const 숫자 = 이거_몇칸임[종류]
	if (!숫자)
		return 1

	const 몇개 = 종류 === "부분"
		? 왼쪽.querySelector(".페이지." + 종류).children.length
		: 임시_목록[종류].length
	return Math.ceil(몇개 / 숫자)
}






const 선택한_동영상 = { id : null, 제목 : null }
const 선택한_채널 = { 이름 : null, 주소 : null }

const 시간_관리 = { 시작 : null, 종료 : null }
const 문자열_관리 = { 시작 : null, 종료 : null }

const 페이지_관리 = { 동영상 : 1, 쇼츠 : 1, 부분 : 1 }



function 페이지_갱신(종류)
{
	const 페이지_지금 = 페이지_관리[종류]

	const 숫자 = 이거_몇칸임[종류]
	if (숫자)
	{
		const 숫자_최소 = (페이지_지금 - 1) * 숫자
		const 숫자_최대 = (페이지_지금 * 숫자) - 1

		const 그거 = 왼쪽.querySelector(".페이지." + 종류).children
		for (const 버튼 of 그거)
		{
			const 번호 = +버튼.dataset.숫자
			const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
			버튼.style.display = 몇번 ? "" : "none"
		}
	}

	const 구역 = 구역_찾기(종류)
	const [버튼_이전, 버튼_지금, 버튼_다음] =
		구역.querySelector(".머리말_페이지")?.children

	if (!(버튼_이전 && 버튼_지금 && 버튼_다음))
		return

	const 버튼_이전_문자열 = 버튼_이전.children[0]
	const 버튼_다음_문자열 = 버튼_다음.children[0]

	const 페이지_수 = 페이지_최대(종류)

	if (페이지_수 <= 1)
	{
		for (const 숫자 of 버튼_지금.children)
		{
			숫자.textContent = ""
		}
		return
	}

	버튼_이전_문자열.textContent = 페이지_지금 === 1 ? "" : "이전"
	버튼_다음_문자열.textContent = 페이지_지금 >= 페이지_수 ? "" : "다음"

	for (let 한장_차이 = -1 ; 한장_차이 <= +1 ; 한장_차이++)
	{
		const 페이지_숫자 = 페이지_지금 + 한장_차이

		버튼_지금.children[한장_차이 + 1].textContent =
			(페이지_숫자 < 1 || 페이지_숫자 > 페이지_수) ? "" : 페이지_숫자
	}
}



function 선택한_동영상_준비(id, start = 0, end = 0)
{
	document.activeElement?.blur?.()

	선택한_동영상.id = id

	if (arguments.length === 1)
		return 선택한_동영상.id

	const 시작 = 시간_표기법(start)
	시간_관리.시작 = 시작[0]
	문자열_관리.시작 = 시작[1]

	const 종료 = 시간_표기법(end)
	시간_관리.종료 = 종료[0]
	문자열_관리.종료 = 종료[1]

	player.cueVideoById(
	{
		videoId : 선택한_동영상.id,
		...(시간_관리.시작 > 0 && {startSeconds : 시간_관리.시작}),
		...(시간_관리.종료 > 0 && {endSeconds : 시간_관리.종료})
	})
}



function 채우기_페이지(종류, 자료)
{
	const 페이지 = 왼쪽.querySelector(".페이지." + 종류)
	if (!페이지)
		return

	const 동영상들 = 임시_목록[종류] = 자료 ?? 임시_목록[종류]
	if (!동영상들)
		return

	페이지.innerHTML = ""

	조각모음_초기화()
	for (let 숫자 = 0 ; 숫자 < 동영상들.length ; 숫자++)
	{
		const 동영상 = 동영상들[숫자]
		if (!동영상)
			continue

		const 몇번 = (숫자 + "").padStart(3, "0")
		const 버튼 = 만들기_공간("button", 조각모음, "버튼", "", 종류, 몇번)


		const src_1 = "https://img.youtube.com/vi/"
		const src_2 = 동영상.id
		const src_3 = "/mqdefault.jpg"
		const img = document.createElement("img")
		img.loading = "lazy"
		img.src = src_1 + src_2 + src_3

		버튼.appendChild(img)
		조각모음.appendChild(버튼)
	}
	페이지.appendChild(조각모음)

	if (자료)
	{
		페이지_관리[종류] = 1
		페이지_갱신(종류)
	}
}




let 구역_커짐 = null
const 구역_비율 = { 동영상 : 2, 쇼츠 : 2, 부분 : 1 }
function 크기_조절(왼쪽, 그거)
{
	const 생성된_구역_확인 = [...구역들]
	const 확인된_구역_종류들 = 생성된_구역_확인.map(구역 => 구역.dataset.종류)

	const 조절_딸깍 = 구역_커짐 === 그거 ? null : 그거

	const 비율들 = 확인된_구역_종류들.map(종류 =>
	{
		if (확인된_구역_종류들.length === 1)
			return "minmax(0, 1fr)"

		if (조절_딸깍)
			return 종류 === 조절_딸깍 ? "minmax(0, 1fr)" : "minmax(0, 0fr)"

		return "minmax(0, " + 구역_비율[종류] + "fr)"
	})

	왼쪽.style.gridTemplateRows = 비율들.join(" ")

	구역_커짐 = 조절_딸깍

	const 이거 = 왼쪽.querySelectorAll(".머리말_크기 .문자열_클릭")
	for (const 크기 of 이거)
	{
		크기.textContent = 크기.dataset.종류 === 구역_커짐 ? "작게" : "크게"
	}

	const 구역_부분 = 왼쪽.querySelector(".구역[data-종류=부분]")
	if (구역_부분)
	{
		const 커짐 = 구역_커짐 === "부분"
		구역_부분.dataset.크기 = 커짐 ? "커짐" : "작아짐"

		const 드롭다운_칸 = 구역_부분.querySelector(".드롭다운_칸")
		if (드롭다운_칸)
		{
			드롭다운_칸.inert = 커짐
		}

		const 노래_목록 = 구역_부분.querySelector(".크기_계산.부분")
		if (노래_목록)
		{
			노래_목록.inert = !커짐
		}
	}
}




function 만들기_부분(본문, 크기_계산, 페이지)
{
	if (!임시_목록.부분)
		return

	const 구역_동영상 = 구역_찾기("동영상")
	const 구역_쇼츠 = 구역_찾기("쇼츠")
	const 구역 = 본문.closest(".구역")
	if (!구역)
		return

	function 드롭다운()
	{
		if (!구역_동영상 && !구역_쇼츠)
			return

		const 드롭다운_공간 = 만들기_공간("section", 본문, "드롭다운_공간")
			const 드롭다운_칸 = 만들기_공간("div", 드롭다운_공간, "드롭다운_칸")
			const 선택지 = 만들기_공간("select", 드롭다운_칸, "드롭다운_선택")

			const 선택지_가짜 = 만들기_공간("option", 선택지, null, "듣고 싶은 노래를 골라보세요")
			선택지_가짜.value = ""
			선택지_가짜.selected = true
			선택지_가짜.disabled = true
			선택지_가짜.hidden = true

		조각모음_초기화()
		for (let 순서 = 0 ; 순서 < 임시_목록.부분.length ; 순서++)
		{
			const 노래 = 임시_목록.부분[순서]
			const 항목 = 만들기_공간("option", 조각모음, null, 노래.이름 + " - " + 노래.제목)
			항목.value = String(순서).padStart(3, "0")
		}
		선택지.appendChild(조각모음)

		const 재생 = 만들기_공간("button", 드롭다운_칸, "재생_시작_버튼")
		const 듣기 = 만들기_공간("span", 재생, null, "듣기")
		재생.disabled = true

		선택지.addEventListener("change", () => 재생.disabled = !선택지.value)

		function 딸깍()
		{
			const 노래 = 임시_목록.부분[+선택지.value]
			if (!노래)
				return

			선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
		}
		재생.addEventListener("click", 딸깍)
	}

	function 만들기_노래_목록()
	{
		크기_계산.inert = 구역.dataset.크기 !== "커짐"

		조각모음_초기화()
		for (let 번호 = 0 ; 번호 < 임시_목록.부분.length ; 번호++)
		{
			const 노래 = 임시_목록.부분[번호]
			const 몇번 = (번호 + "").padStart(3, "0")

			const 항목 = 만들기_공간("div", 조각모음, "노래_항목", "", "부분", 몇번)
				const 칸_이름 = 만들기_공간("span", 항목, "노래_칸 노래_이름", 노래.이름)
				const 칸_구분선 = 만들기_공간("div", 항목, "노래_구분선")
				const 칸_제목 = 만들기_공간("span", 항목, "노래_칸 노래_제목", 노래.제목)
				const 칸_재생 = 만들기_공간("button", 항목, "노래_칸 재생_시작_버튼")
					const 재생 = 만들기_공간("span", 칸_재생, "재생_시작_버튼", "듣기")
		}
		페이지.appendChild(조각모음)

		function 딸깍(클릭)
		{
			const 재생_버튼 = 클릭.target.closest(".재생_시작_버튼")
			if (!재생_버튼)
				return

			const 항목 = 재생_버튼.closest(".노래_항목")
			const 노래 = 임시_목록.부분[+항목.dataset.숫자]
			if (!노래)
				return

			선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
		}
		페이지.addEventListener("click", 딸깍)
	}

	구역.dataset.크기 = "작아짐"
	드롭다운()
	만들기_노래_목록()

}



function 만들기_목록()
{
	if (임시_목록.원곡 || 임시_목록.커버)
	{
		임시_목록.동영상 = (임시_목록.원곡 ?? []).concat(임시_목록.커버 ?? [])
	}

	const 종류_확인 =
	[
		{ 종류 : "동영상", 자료 : 임시_목록.동영상 },
		{ 종류 : "쇼츠", 자료 : 임시_목록.쇼츠 },
		{ 종류 : "부분", 자료 : 임시_목록.부분 },
	]

	for (const 분류 of 종류_확인)
	{
		if (!분류.자료 || 분류.자료.length === 0)
			continue

		const 구역 = 만들기_공간("section", 왼쪽, "구역", "", 분류.종류)

		const 머리말 = 만들기_공간("header", 구역, "머리말")
			const 머리말_재생목록 = 만들기_공간("div", 머리말, "머리말_재생목록")
				const 머리말_재생목록_문자열 = 만들기_공간("span", 머리말_재생목록, null, 분류.종류)
			const 머리말_종류 = 만들기_공간("menu", 머리말, "머리말_종류")
			const 머리말_페이지 = 만들기_공간("menu", 머리말, "머리말_페이지")
			const 머리말_크기 = 만들기_공간("button", 머리말, "머리말_크기")
				const 크기_조절_문자열 = 만들기_공간("span", 머리말_크기, "문자열_클릭", "크게", 분류.종류)
				크기_조절_문자열.addEventListener("click", () => 크기_조절(왼쪽, 분류.종류))

		if (분류.종류 === "동영상")
		{
			if (임시_목록.원곡 && 임시_목록.커버)
			{
				const 종류_목록 =
				[
					{ 이름 : "모두", 자료 : 임시_목록.동영상 },
					{ 이름 : "원곡", 자료 : 임시_목록.원곡 },
					{ 이름 : "커버", 자료 : 임시_목록.커버 },
				]
				for (const 종류 of 종류_목록)
				{
					const 종류_버튼 = 만들기_공간("button", 머리말_종류, "종류_" + 종류.이름)

						const 문자열 = 만들기_공간("span", 종류_버튼, "문자열_클릭", 종류.이름)
						문자열.addEventListener("click", () => 채우기_페이지(분류.종류, 종류.자료))
				}
			}
		}


		const 페이지_버튼_종류 =
		[
			{ 넘김 : "이전", 한장 : -1 },
			{ 넘김 : "지금", 한장 : 0 },
			{ 넘김 : "다음", 한장 : +1 },
		]
		for (const 버튼_그거 of 페이지_버튼_종류)
		{
			const 버튼 = 만들기_공간("button", 머리말_페이지, "버튼_" + 버튼_그거.넘김, "", 분류.종류)

			if (버튼_그거.한장 === 0)
			{
				for (const 버튼_숫자 of ["이전_숫자", "지금_숫자", "다음_숫자"])
				{
					const 숫자 = 만들기_공간("span", 버튼, 버튼_숫자, "", 분류.종류)
				}
				continue
			}

			const 문자열 = 만들기_공간("span", 버튼, "문자열_클릭")
			문자열.addEventListener("click", () => 페이지_넘기기(분류.종류, 버튼_그거.한장))
		}

		const 본문 = 만들기_공간("section", 구역, "본문")

		const 크기_계산 = 만들기_공간("div", 본문, "크기_계산 " + 분류.종류)

		const 페이지 = 만들기_공간("div", 크기_계산, "페이지 " + 분류.종류)

		if (분류.종류 === "부분")
		{
			만들기_부분(본문, 크기_계산, 페이지)
			continue
		}

		function 딸깍(클릭)
		{
			const 버튼 = 클릭.target.closest(".버튼")
			if (!버튼)
				return

			const 종류 = 버튼.dataset.종류
			const 동영상 = 임시_목록[종류][+버튼.dataset.숫자]
			const 쇼츠 = 종류 === "쇼츠"
			선택한_동영상_준비(동영상.id,
				쇼츠 ? 0 : 동영상.시작,
				쇼츠 ? 0 : 동영상.종료)
		}
		페이지.addEventListener("click", 딸깍)

		페이지_갱신(분류.종류)
		채우기_페이지(분류.종류)
	}


	구역들 = 왼쪽.querySelectorAll(".구역")
	왼쪽.style.gridTemplateRows = [...구역들]
	.map(구역 => "minmax(0, " + 구역_비율[구역.dataset.종류] + "fr)")
	.join(" ")

	if (구역들.length === 1)
	{
		왼쪽.querySelector(".머리말_크기").style.visibility = "hidden"
		크기_조절(왼쪽, 구역들[0].dataset.종류)
	}
}



function 만들기_구역()
{
	만들기_목록()

	const 크기_계산 = 왼쪽.querySelectorAll(".크기_계산")
	for (const 감지 of 크기_계산)
	{
		재구성.observe(감지)
	}
}






//////////////////////////////////////////////////////////////////////////////////////

function id_찾기(주소)
{
	try
	{
		const url = new URL(주소)

		const list = url.searchParams.get("list")
		if (list && list.startsWith("PL"))
			return

		const v = url.searchParams.get("v")
		const path = url.pathname.split("/").pop()
		const id_동영상 = v ?? path

		const 정규표현식 = /^[a-zA-Z0-9_-]{11}$/
		if (!정규표현식.test(id_동영상))
			return

		const t = parseInt(url.searchParams.get("t"))
		return (Number.isNaN(t)) ? id_동영상 : [id_동영상, t]
	}
	catch {}
}


function 불러오기_재생목록(이름)
{
	delete window.재생목록

	const script = document.createElement("script")
	script.src = "명단/" + 이름 + ".js"

	function 불러오기_소개(소개)
	{
		if (!소개)
			return

		const 선택 = 소개.length === 1
			? 소개[0]
			: 소개[Math.floor(Math.random() * 소개.length)]

		선택한_동영상_준비(선택.id)
	}

	function id_가공(재생목록)
	{
		const keys = Object.keys(재생목록)
		for (const key of keys)
		{
			if (!Array.isArray(재생목록[key]))
				continue

			for (const 동영상 of 재생목록[key])
			{
				if (!동영상.id || 동영상.id.length === 0)
					continue

				const id = id_찾기(동영상.id)
				const 값 = Array.isArray(id) ? id[0] : id
				if (값)
				{
					if (key === "부분")
					{
						const 펼침 = (동영상.노래 ?? [])
							.filter(노래 => 노래.이름 && 노래.제목 && 노래.시작 && 노래.종료)
							.map(노래 => ({ id : 값, ...노래 }))
						임시_목록[key] ??= []
						임시_목록[key].push(...펼침)
						continue
					}
					const { id, ...rest } = 동영상
					임시_목록[key] ??= []
					임시_목록[key].push({ id : 값, ...rest })
				}
			}
		}
	}

	function 나만의_색깔(색깔)
	{
		if (!색깔)
			return

		const 스타일 = document.documentElement.style

		for (const 이거 of Object.keys(색깔))
		{
			if (색깔[이거])
			{
				스타일.setProperty("--" + 이거, 색깔[이거])
			}
		}
	}

	script.addEventListener("error", () =>
	{
		대기열(왼쪽_이름.querySelector(".본문"), "불러오기 실패")
	})

	async function 불러오기()
	{
		try
		{
			document.head.appendChild(api)
			나만의_색깔(window.재생목록.색깔)
			await api_준비
			await id_가공(window.재생목록)

			delete window.재생목록
			script.remove()

			await 불러오기_소개(임시_목록.소개)
			만들기_구역()
			왼쪽_이름.remove()
			오른쪽_안내.remove()
		}
		catch
		{
			대기열(왼쪽_이름.querySelector(".본문"), "불러오기 실패")
		}
	}
	script.addEventListener("load", 불러오기)
	document.head.appendChild(script)
}

///////////////////////////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////////////////////////////////////////////////////////////////

function 대기열(본문, 출력)
{
	if (!본문)
		return

	if (!출력)
	{
		const 있냐 = 본문.querySelector(".대기열")
		if (있냐)
			return 있냐.remove()
	}

	본문.innerHTML = ""
	만들기_공간("div", 본문, "대기열", 출력)
}



const 가나다순 =
[
	"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
	"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
]
const A_Z =
[
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
]
const 소속사 = []
function 시작()
{
	function 채우기_이름표들()
	{
		const 본문 = 만들기_공간("section", 왼쪽_이름, "본문")

		대기열(본문, "불러오는 중")

		function 가나다순_정렬(목록)
		{
			const 규칙 = new Intl.Collator("ko")
			const 정렬 = [...목록].sort((앞, 뒤) => 규칙.compare(앞.이름.trim(), 뒤.이름.trim()))

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

		const 이름표들 = 만들기_공간("menu", 본문, "이름표들")


		조각모음_초기화()
		for (const 누구 of 이름들)
		{
			const 이름표 = 만들기_공간("button", 조각모음, "이름표")

			const 이름 = 만들기_공간("span", 이름표, null, 누구.중복 ? 누구.이름 + "+" : 누구.이름)
			이름.dataset.이름 = 누구.이름
		}
		이름표들.appendChild(조각모음)

		function 딸깍(클릭)
		{
			const 이름표 = 클릭.target.closest("span")
			if (!이름표)
				return

			const 이름 = 이름표.dataset.이름
			본문.innerHTML = ""
			document.title = 이름
			대기열(본문, "준비 중")
			불러오기_재생목록(이름)
		}
		이름표들.addEventListener("click", 딸깍)

		대기열(본문)
	}

	function 채우기_가나다()
	{
		const 가나다 = document.getElementById("가나다")

		조각모음_초기화()
		for (const 순서대로 of 가나다순)
		{
			const 자음_상자 = 만들기_공간("button", 조각모음, "자음_상자")

				const 자음 = 만들기_공간("span", 자음_상자, 순서대로, 순서대로)

			const 자음_번호 = 만들기_공간("button", 조각모음, "자음_번호")

				const 몇개 = 만들기_공간("span", 자음_번호, 순서대로)
		}
		가나다.appendChild(조각모음)
	}

	채우기_가나다()
	채우기_이름표들()

	// 채우기_안내목록() 추가 함수 필요
	// 채우기_안내문()
}
시작()