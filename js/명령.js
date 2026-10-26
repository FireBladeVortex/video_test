
// YouTube Player iframe API 준비
const api = document.createElement("script")
api.src = "https://www.youtube.com/iframe_api"

let api_준비_대기 = null
const api_준비 = new Promise(resolve => { api_준비_대기 = resolve })

let player = null
// iframe 호출할 때
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

		// 현재 상태 불러오기
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



///////////////////////////////////////////////////////////////////////////////////////////////////


const 재생_시간_지금 = document.getElementById("재생_시간_지금")
const 동영상_제목 = document.getElementById("동영상_제목")
const 제목표시줄 = document.getElementById("제목표시줄")
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
	catch
	{
		return
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
		catch
		{
		}
		if (title)
		{
			동영상_제목.style.textAlign = "start"
			제목표시줄.textContent = title
			불러오기_제목(선택한_동영상.id, title)
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
	const 오른쪽 = document.querySelectorAll("#오른쪽")
	for (const 화면 of 오른쪽)
	{
		화면.style.cursor = 상태 ? "pointer" : "default"
		화면.onclick = 상태 ? 재생_일시중지_조작 : null
	}
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
	// const 증가 = 키.code === "NumpadAdd" || 키.code === "ArrowUp"
	// const 감소 = 키.code === "NumpadSubtract" || 키.code === "ArrowDown"
	const 증감 =
		(키.code === "NumpadAdd" || 키.code === "ArrowUp")
		- (키.code === "NumpadSubtract" || 키.code === "ArrowDown")
	// const 컨트롤_쉬프트 = 키.ctrlKey || 키.shiftKey

	if (증감)
	{
		키.preventDefault()
		소리_크기_값_조절(증감 * 5)
	}
	// if (!컨트롤_쉬프트)
	// {
		// if (증가)
		// {
		// 	키.preventDefault()
		// 	소리_크기_값_조절(+5)
		// }
		// else if (감소)
		// {
		// 	키.preventDefault()
		// 	소리_크기_값_조절(-5)
		// }
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
			player.seekTo(Math.max(시간_관리.시작, player.getCurrentTime() - 5), true)
		}
		else if (키.code === "ArrowRight")
		{
			키.preventDefault()
			player.seekTo(Math.min(시간_관리.종료, player.getCurrentTime() + 5), true)
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
	if (마우스휠.target.closest("#오른쪽"))
	{
		마우스휠.preventDefault()
		소리_크기_값_조절(마우스휠.deltaY < 0 ? +5 : -5)
		return
	}

	const 구역 = 마우스휠.target.closest(".구역[data-종류=동영상], .구역[data-종류=쇼츠]")
	if (구역)
	{
		마우스휠.preventDefault()
		페이지_넘기기(구역.dataset.종류, 마우스휠.deltaY > 0 ? +1 : -1)
		return
	}

	마우스휠.preventDefault()
}
document.addEventListener("wheel", 드르륵, { passive : false })


document.getElementById("처음으로").addEventListener("click", () => location.reload())


///////////////////////////////////////////////////////////////////////////////////////////////////



// 시간 표시 변환
// 100000초 또는 12:34:56 같은 모양으로
// 없는거 채워서 시간값 2개 전달하기
function 시간_표기법(시간)
{
	const 값 =
		typeof 시간 === "number"
		? 시간
		: (typeof 시간 === "string" && /[:;]/.test(시간))
			? 시간.split(/[:;]/).reduce((합, 값) => 합 * 60 + +값, 0)
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








































































function 만들기_부분(본문, 크기_계산, 페이지)
{
	if (!임시_목록.부분)
		return

	function 구역_찾기(종류)
	{
		return document.querySelector(".구역[data-종류=" + 종류 + "]")
	}

	const 구역_동영상 = 구역_찾기("동영상")
	const 구역_쇼츠 = 구역_찾기("쇼츠")
	const 구역 = 구역_찾기("부분")
	if (!구역)
		return

	function 드롭다운()
	{
		if (!구역_동영상 && !구역_쇼츠)
			return

		const 드롭다운_공간 = document.createElement("section")
		드롭다운_공간.className = "드롭다운_공간"
		본문.appendChild(드롭다운_공간)

			const 드롭다운_칸 = document.createElement("div")
			드롭다운_칸.className = "드롭다운_칸"
			드롭다운_공간.appendChild(드롭다운_칸)

			const 선택지 = document.createElement("select")
			선택지.className = "드롭다운_선택"
			드롭다운_칸.appendChild(선택지)

			const 선택지_가짜 = document.createElement("option")
			선택지_가짜.value = ""
			선택지_가짜.textContent = "노래 골라"
			선택지_가짜.selected = true
			선택지_가짜.disabled = true
			선택지_가짜.hidden = true
			선택지.appendChild(선택지_가짜)

			for (let 순서 = 0 ; 순서 < 임시_목록.부분.length ; 순서++)
			{
				const 노래 = 임시_목록.부분[순서]
				const 항목 = document.createElement("option")
				항목.value = 순서 + ""
				항목.textContent = 노래.이름 + " - " + 노래.제목
				선택지.appendChild(항목)
			}

			const 재생 = document.createElement("button")
			재생.className = "재생_시작_버튼"
			재생.textContent = "듣기"
			재생.disabled = true
			드롭다운_칸.appendChild(재생)

		선택지.addEventListener("change", () => 재생.disabled = 선택지.value === "")

		재생.addEventListener("click", () =>
		{
			const 노래 = 임시_목록.부분[+선택지.value]
			if (!노래)
				return

			// 이미지_클릭_강조("드롭다운")
			선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
		})
	}

	function 만들기_노래_목록()
	{
		크기_계산.inert = 구역.dataset.크기 !== "커짐"

		for (let 번호 = 0 ; 번호 < 임시_목록.부분.length ; 번호++)
		{
			const 노래 = 임시_목록.부분[번호]
			const 몇번 = (번호 + "").padStart(3, "0")

			const 항목 = document.createElement("div")
			항목.className = "노래_항목"
			항목.dataset.종류 = "부분"
			항목.dataset.숫자 = 몇번
			페이지.appendChild(항목)

			const 칸_이름 = document.createElement("span")
			칸_이름.className = "노래_칸 노래_이름"
			칸_이름.textContent = 노래.이름
			항목.appendChild(칸_이름)

			const 칸_구분선 = document.createElement("div")
			칸_구분선.className = "노래_구분선"
			항목.appendChild(칸_구분선)

			const 칸_제목 = document.createElement("span")
			칸_제목.className = "노래_칸 노래_제목"
			칸_제목.textContent = 노래.제목
			항목.appendChild(칸_제목)

			const 칸_재생 = document.createElement("button")
			칸_재생.className = "노래_칸 노래_재생"
			항목.appendChild(칸_재생)

			const 재생 = document.createElement("span")
			재생.className = "재생_시작_버튼"
			재생.textContent = "듣기"
			칸_재생.appendChild(재생)
			재생.addEventListener("click", () =>
			{
				// 이미지_클릭_강조("부분" + 몇번)
				선택한_동영상_준비(노래.id, 노래.시작, 노래.종료)
			})
		}
	}

	구역.dataset.크기 = "작아짐"
	드롭다운()
	만들기_노래_목록()

}




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
const 길이 = {}
길이.가로 = parseInt(설정.getPropertyValue("--가로"))
길이.세로 = parseInt(설정.getPropertyValue("--세로"))
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
		? document.querySelectorAll(".노래_항목").length
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

		const 구역 = document.querySelector(".구역[data-종류=" + 종류 + "]")
		const 불러올거 = ".버튼[data-종류=" + 종류 + "], .노래_항목[data-종류=" + 종류 + "]"
		const 그거 = 구역.querySelectorAll(불러올거)
		for (const 버튼 of 그거)
		{
			const 번호 = +버튼.dataset.숫자
			const 몇번 = 번호 >= 숫자_최소 && 번호 <= 숫자_최대
			버튼.style.display = 몇번 ? "" : "none"
		}
	}

	// function 페이지_버튼_찾기(종류, 위치)
	// {
	// 	return document.querySelector(".버튼_" + 위치 + "[data-종류=" + 종류 + "]")
	// }
	// const 버튼_이전 = 페이지_버튼_찾기(종류, "이전")
	// const 버튼_지금 = 페이지_버튼_찾기(종류, "지금")
	// const 버튼_다음 = 페이지_버튼_찾기(종류, "다음")

	const [버튼_이전, 버튼_지금, 버튼_다음] =
		document.querySelector(".구역[data-종류=" + 종류 + "] .머리말_페이지")?.children ?? []

	if (!버튼_이전 || !버튼_지금 || !버튼_다음)
		return

	const 버튼_이전_문자열 = 버튼_이전.querySelector(".문자열_클릭")
	const 버튼_다음_문자열 = 버튼_다음.querySelector(".문자열_클릭")

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
	버튼_지금.textContent = ""
	버튼_다음_문자열.textContent = 페이지_지금 >= 페이지_수 ? "" : "다음"

	const 페이지_앞_지금_뒤 = ["이전_숫자", "지금_숫자", "다음_숫자"]
	for (let 한장_차이 = -1 ; 한장_차이 <= +1 ; 한장_차이++)
	{
		const 페이지_숫자 = 페이지_지금 + 한장_차이

		버튼_지금.children[한장_차이 + 1].textContent =
			(페이지_숫자 < 1 || 페이지_숫자 > 페이지_수) ? "" : 페이지_숫자

		// const 숫자 = document.createElement("span")
		// 숫자.className = 페이지_앞_지금_뒤[한장_차이 + 1]
		// 숫자.dataset.종류 = 종류
		// 숫자.textContent = (페이지_숫자 < 1 || 페이지_숫자 > 페이지_수) ? "" : 페이지_숫자
		// 버튼_지금.appendChild(숫자)
	}
}



function 선택한_동영상_준비(id, start = 0, end = 0)
{
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
		startSeconds : 시간_관리.시작,
		...(시간_관리.종료 > 0 && {endSeconds : 시간_관리.종료})
	})
}



let 이미지_클릭함 = null
function 이미지_클릭_강조(이거)
{
	const 버튼 = document.querySelectorAll(".버튼")
	for (const 딸깍 of 버튼)
	{
		const 그거 = 딸깍.dataset.종류 + 딸깍.dataset.숫자
		const 클릭 = 그거 === 이거
		딸깍.classList.toggle("강조", 클릭)
		딸깍.classList.toggle("밝게", !클릭)
	}
	이미지_클릭함 = 이거
}





function 채우기_페이지(종류, 자료)
{
	const 페이지 = document.querySelector(".페이지." + 종류)
	if (!페이지)
		return

	const 동영상들 = 임시_목록[종류] = 자료 ?? 임시_목록[종류]
	if (!동영상들)
		return

	페이지.innerHTML = ""
	const 조각모음 = document.createDocumentFragment()

	for (let 숫자 = 0 ; 숫자 < 동영상들.length ; 숫자++)
	{
		const 동영상 = 동영상들[숫자]
		if (!동영상)
			continue

		const 버튼 = document.createElement("button")
		버튼.className = "버튼"
		버튼.dataset.종류 = 종류
		const 몇번 = (숫자 + "").padStart(3, "0")
		버튼.dataset.숫자 = 몇번

		const img = document.createElement("img")
		img.loading = "lazy"
		const src_1 = "https://img.youtube.com/vi/"
		const src_2 = 동영상.id
		const src_3 = "/mqdefault.jpg"
		img.src = src_1 + src_2 + src_3

		버튼.appendChild(img)
		조각모음.appendChild(버튼)
	}

	페이지.appendChild(조각모음)

	if (자료)
	{
		이미지_클릭함 = null
		페이지_관리[종류] = 1
		페이지_갱신(종류)
	}
}




let 구역_커짐 = null
const 구역_비율 = { 동영상 : 2, 쇼츠 : 2, 부분 : 1 }
function 크기_조절(왼쪽, 그거)
{
	const 생성된_구역_확인 = [...왼쪽.querySelectorAll(".구역")]
	const 확인된_구역_종류들 = 생성된_구역_확인.map(구역 => 구역.dataset.종류)

	const 조절_딸깍 = 구역_커짐 === 그거 ? null : 그거

	// (수정) "시작"
	// fr 값을 minmax(0, Nfr) 로 감싸서 내용 때문에 행이 커지지 않게 함
	const 비율들 = 확인된_구역_종류들.map(종류 =>
	{
		if (확인된_구역_종류들.length === 1)
			return "minmax(0, 1fr)"

		if (조절_딸깍)
			return 종류 === 조절_딸깍 ? "minmax(0, 1fr)" : "minmax(0, 0fr)"

		return "minmax(0, " + 구역_비율[종류] + "fr)"
	})
	// (수정) "종료"

	왼쪽.style.gridTemplateRows = 비율들.join(" ")

	구역_커짐 = 조절_딸깍

	const 이거 = document.querySelectorAll(".머리말_크기 .문자열_클릭")
	for (const 크기 of 이거)
	{
		크기.textContent = 크기.dataset.종류 === 구역_커짐 ? "작게" : "크게"
	}

	const 부분_구역 = document.querySelector(".구역[data-종류=부분]")
	if (부분_구역)
	{
		const 커짐 = 구역_커짐 === "부분"
		부분_구역.dataset.크기 = 커짐 ? "커짐" : "작아짐"

		const 드롭다운_칸 = 부분_구역.querySelector(".드롭다운_칸")
		if (드롭다운_칸)
		{
			드롭다운_칸.inert = 커짐
		}

		const 노래_목록 = 부분_구역.querySelector(".크기_계산.부분")
		if (노래_목록)
		{
			노래_목록.inert = !커짐
		}
	}
}



function 만들기_목록()
{
	const 왼쪽 = document.getElementById("왼쪽")

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

		const 구역 = document.createElement("section")
		구역.className = "구역"
		구역.dataset.종류 = 분류.종류
		왼쪽.appendChild(구역)

		const 머리말 = document.createElement("header")
		머리말.className = "머리말"
		구역.appendChild(머리말)

			const 머리말_재생목록 = document.createElement("div")
			머리말_재생목록.className = "머리말_재생목록"
			머리말.appendChild(머리말_재생목록)

				const 머리말_재생목록_문자열 = document.createElement("span")
				머리말_재생목록_문자열.textContent = 분류.종류
				머리말_재생목록.appendChild(머리말_재생목록_문자열)

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
					const 종류_버튼 = document.createElement("button")
					종류_버튼.className = "종류_" + 종류.이름
					머리말_종류.appendChild(종류_버튼)

						const 문자열 = document.createElement("span")
						문자열.className = "문자열_클릭"
						문자열.textContent = 종류.이름
						종류_버튼.appendChild(문자열)
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
			const 버튼 = document.createElement("button")
			버튼.className = "버튼_" + 버튼_그거.넘김
			버튼.dataset.종류 = 분류.종류
			머리말_페이지.appendChild(버튼)

			if (버튼_그거.한장 === 0)
			{
				for (const 버튼_숫자 of ["이전_숫자", "지금_숫자", "다음_숫자"])
				{
					const 숫자 = document.createElement("span")
					숫자.className = 버튼_숫자
					숫자.dataset.종류 = 분류.종류
					버튼.appendChild(숫자)
				}
				continue
			}

			const 문자열 = document.createElement("span")
			문자열.className = "문자열_클릭"
			버튼.appendChild(문자열)
			문자열.addEventListener("click", () => 페이지_넘기기(분류.종류, 버튼_그거.한장))
		}

		const 본문 = document.createElement("section")
		본문.className = "본문"
		구역.appendChild(본문)

		const 크기_계산 = document.createElement("div")
		크기_계산.className = "크기_계산 " + 분류.종류
		본문.appendChild(크기_계산)

		const 페이지 = document.createElement("div")
		페이지.className = "페이지 " + 분류.종류
		크기_계산.appendChild(페이지)

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
			const 그거 = 종류 + 버튼.dataset.숫자
			if (그거 === 이미지_클릭함)
				return

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

	왼쪽.style.gridTemplateRows = [...왼쪽.querySelectorAll(".구역")]
	.map(구역 => "minmax(0, " + 구역_비율[구역.dataset.종류] + "fr)")
	.join(" ")

	if (왼쪽.querySelectorAll(".구역").length === 1)
	{
		왼쪽.querySelector(".머리말_크기").style.visibility = "hidden"
		크기_조절(왼쪽, 왼쪽.querySelector(".구역").dataset.종류)
	}
}



function 만들기_구역()
{
	만들기_목록()

	const 크기_계산 = document.querySelectorAll(".크기_계산")
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
	catch
	{
		return
	}
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

		player.cueVideoById(
		{
			videoId : 선택.id,
		})
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

	async function 불러오기()
	{
		document.head.appendChild(api)
		나만의_색깔(window.재생목록.색깔)
		await api_준비
		await id_가공(window.재생목록)

		delete window.재생목록
		script.remove()

		await 불러오기_소개(임시_목록.소개)
		만들기_구역()
		document.getElementById("왼쪽_이름").remove()
		document.getElementById("오른쪽_안내").remove()
	}
	script.addEventListener("load", 불러오기)
	document.head.appendChild(script)
}

///////////////////////////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////////////////////////////////////////////////////////////////

function 대기_문자열(본문, 출력)
{
	const 있냐 = document.getElementById("대기_문자열")
	if (있냐)
		return 있냐.remove()

	const 대기_문자열 = document.createElement("div")
	대기_문자열.id = "대기_문자열"
	대기_문자열.textContent = 출력
	본문.appendChild(대기_문자열)
}



const 가나다순 =
[
	"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
	"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
]
const AtoZ =
[
	"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
	"N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
]
const 소속사 = []
function 시작()
{
	function 채우기_이름표들(왼쪽_이름)
	{
		const 본문 = document.createElement("section")
		본문.className = "본문"
		왼쪽_이름.appendChild(본문)

		대기_문자열(본문, "불러오는 중")

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

		const 이름표들 = document.createElement("menu")
		이름표들.className = "이름표들"
		본문.appendChild(이름표들)

		for (const 누구 of 이름들)
		{
			const 이름표 = document.createElement("button")
			이름표.className = "이름표"
			이름표들.appendChild(이름표)

			const 이름 = document.createElement("span")
			이름.dataset.이름 = 누구.이름

			이름.textContent = 누구.중복 ? 누구.이름 + "+" : 누구.이름
			이름표.appendChild(이름)
		}

		이름표들.addEventListener("click", 클릭 =>
		{
			const 이름표 = 클릭.target.closest("span")
			if (!이름표)
				return

			const 이름 = 이름표.dataset.이름
			본문.innerHTML = ""
			document.title = 이름
			대기_문자열(본문, "준비 중")
			불러오기_재생목록(이름)
		})
		대기_문자열(본문)
	}

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

	채우기_가나다()

	const 왼쪽_이름 = document.getElementById("왼쪽_이름")
	채우기_이름표들(왼쪽_이름)

	const 오른쪽_안내 = document.getElementById("오른쪽_안내")
	// 채우기_안내목록() 추가 함수 필요
	// 채우기_안내문()
}
시작()