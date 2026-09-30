

// 이름 가나다순_정렬
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

















function get_songs(video) // valid_list 생성 대신 video 하나당 유효한 song 목록을 즉석에서 반환
{
	const song_list = video.song ?? []

	if (song_list.length === 0)
		return [{ id: video.id }] // id만 가진 경우 유효

	return song_list
		.filter(song => song.lang && song.name && song.title && song.start && song.end) // 모두 가진 것만 유효
		.map(song => ({ id: video.id, ...song }))
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
// !재생중 === !재생() && !일시중지()
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



// 소리 크기 조절하는데 간섭 방지
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
			player.seekTo(Math.max(sec_start, player.getCurrentTime() - 5), true) // sec_start 보다 작아질 수 없음
		}

		// 방향키 오른쪽 = 5초 앞으로
		else if (키.code === "ArrowRight")
		{
			키.preventDefault()
			player.seekTo(Math.min(sec_end, player.getCurrentTime() + 5), true) // sec_end 보다 커질 수 없음
		}

		// 숫자키 0-9 = 현재 재생 위치 변경
		else if (키.code.match(/^(Digit|Numpad)[0-9]$/))
		{
			키.preventDefault()
			const 비율 = +(키.code.slice(-1)) / 10
			const 숫자키 = sec_start + Math.floor((sec_end - sec_start) * 비율)
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


// 만들기 보류
function 재생_속도_조절(키, 증감)
{
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



// 재생 진행 비율 계산 및 시간 표시
function ctrl_view()
{
	// 지금 재생 중인 동영상 시간 확인
	const cur = player.getCurrentTime()
	const ratio = (cur - sec_start) / (sec_end - sec_start)
	document.getElementById("재생_시간_지금").style.width = Math.max(0, Math.min(1, ratio)) * 100 + "%"

	// const [, msg_cur] = 시간_표기법(cur)
	// if (msg_end && msg_start)
	// {
	// 	if (sec_start === 0)
	// 	{
	// 		document.getElementById("플레이어_메세지").textContent = `${msg_cur} < ${msg_end}`
	// 	}
	// 	else
	// 	{
	// 		document.getElementById("플레이어_메세지").textContent = `${msg_start} < ${msg_cur} > ${msg_end}`
	// 	}
	// }
}


let big_type = null // 현재 확대된 섹션 타입 저장
// (수정) 재생 목록 칸 확대/축소 전환 (토글 방식)
function resize_section(type_str)
{
	const 왼쪽 = document.getElementById("왼쪽")
	const rows = { video: "2fr", 쇼츠: "2fr", long: "1fr" }

	const next_big = big_type === type_str ? null : type_str // 같은 타입 재클릭 시 해제

	if (next_big)
	{
		rows.video = type_str === "video" ? "1fr" : "0fr"
		rows.쇼츠 = type_str === "쇼츠" ? "1fr" : "0fr"
		rows.long = type_str === "long" ? "1fr" : "0fr"
	}

	왼쪽.style.gridTemplateRows = `${rows.video} ${rows.쇼츠} ${rows.long}`

	big_type = next_big // 상태 갱신

	document.querySelectorAll(".h1_크기 .문자열_클릭").forEach(span => // 모든 토글 문자열 재설정
	{
		span.textContent = span.dataset.type === big_type ? "작게" : "크게"
	})
}


// 마지막 페이지 번호 계산 공통 함수
function get_last(type_str)
{
	const num = total_cell[type_str]
	const data = active_data[type_str] ?? list_data[type_str]
	return Math.ceil(data.length / num)
}


function click_img(target)
{
	// 활성화 버튼 강조 나머지 버튼 어둡게
	document.querySelectorAll(".버튼").forEach(버튼 =>
	{
		const compare = (버튼.dataset.type + "_" + (버튼.dataset.num + "").padStart(3, "0"))
		const click_img = compare === target
		버튼.classList.toggle("강조", click_img)
		버튼.classList.toggle("발기", !click_img)
	})
	// total_list에서 클릭한 썸네일 또 클릭할때 쓰는 장치
	img_click = target
}



// 미리보기 몇개 들어가는지 계산
function calc_size(목록)
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





// multiple 값에 맞는 범위만 썸네일 표시/숨김
function update_page(type_str)
{
	const num = total_cell[type_str]
	if (!num)
		return

	const multiple = type_str === "쇼츠" ? short_multiple : video_multiple
	const min_num = (multiple - 1) * num
	const max_num = (multiple * num) - 1

	document.querySelectorAll(`.버튼[data-type="${type_str}"]`).forEach(버튼 =>
	{
		const idx = +버튼.dataset.num
		const show = idx >= min_num && idx <= max_num
		버튼.style.display = show ? "" : "none"
	})
}

// 크기 변경 시 multiple, 표시값 초기화
function reset_page(type_str)
{
	if (type_str === "쇼츠")
		short_multiple = 1
	else
		video_multiple = 1


	render_nav(type_str)
}



// youtube 정보 가져오기 cue 상태 되기전
function ready_data(id, start = 0, end = 0)
{
	// // 주소에서 id 추출
	// const url = new URL(id)
	// const get_id = url.searchParams.get("v") ?? url.pathname.split("/").pop()
	const get_id = id

	if (arguments.length === 1)
		return get_id

	// 클릭 시 id 저장
	set_id = id

	// // 주소에서 t값 추출 + 시작시간 비교후 결정
	// const get_start = parseInt(url.searchParams.get("t"))
	// const set_start = !Number.isNaN(get_start) ? get_start : start
	const start_t = 시간_표기법(start)
	sec_start = start_t[0]
	msg_start = start_t[1]

	// 종료 시간 결정(getDuration() 아님)
	const end_t = 시간_표기법(end)
	sec_end = end_t[0]
	msg_end = end_t[1]

	// 영상 불러오기
	player.cueVideoById(
	{
		videoId : get_id,
		startSeconds : sec_start, // 광고 때문에 sec_start 대신 임시로 0
		...(sec_end > 0 && {endSeconds : sec_end})
	})

}


// 이름 제목
async function fetch_oembed(id) // 값 실적용 대신 뱉어내는 방식으로 변경
{
	// const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
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




// 모두/원곡/커버 클릭 시 표시할 video 데이터 교체
function switch_video_data(next_data)
{
	active_data.video = next_data // 현재 데이터 갱신

	const 페이지 = document.querySelector(`.페이지.video`)
	if (페이지)
	{
		// 기존 썸네일 제거 후 재생성
		페이지.innerHTML = ""
	}

	fill_page("video") // 새 데이터로 다시 채움

	video_multiple = 1 // 페이지 번호 초기화
	render_nav("video")
	update_page("video")
}


// 크기 계산
const total_cell = { video: 0, 쇼츠: 0 }

const resize = new ResizeObserver(구역 =>
{
	구역.forEach(목록 =>
	{
		const 분류 = 목록.target.classList.contains("쇼츠") ? "쇼츠" : "video"
		total_cell[분류] = calc_size(목록)

		reset_page(분류)
		update_page(분류)
	})
})





// 영상 상태 확인
// YT.PlayerState.ENDED = 0
// YT.PlayerState.PLAYING = 1
// YT.PlayerState.PAUSED = 2
// YT.PlayerState.BUFFERING = 3
// YT.PlayerState.CUED = 5

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
		if (sec_end === 0)
		{
			[sec_end, msg_end] = 시간_표기법(player.getDuration())
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
			fetch_oembed(set_id, title)
		}
		else
		{
			fetch_oembed(set_id)
		}
	}
	// 재생 중일 때 100ms마다 진행바 갱신
	if (event.data === 1)
	{
		if (player.getCurrentTime() < sec_start)
		{
			player.seekTo(sec_start, true)
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
		player.seekTo(sec_start, true)
		player.playVideo()
	}
	//
	const pop = [1, 2, 3].includes(event.data)
	// ("#오른쪽, #클릭_방지") // #클릭_방지 임시 중지 사용자 선택으로 버튼 만들기 전까지
	document.querySelectorAll("#오른쪽").forEach(overlay =>
	{
		overlay.style.cursor = pop ? "pointer" : "default"
		overlay.onclick = pop ? play_or_pause : null
	})
	// document.getElementById("클릭_방지").style.pointerEvents = pop ? "auto" : "none"
}





// intro 데이터 재생 준비 (추가) - 재생목록이면 cuePlaylist(랜덤), 일반 동영상이면 cueVideoById
function cue_intro(intro)
{
	if (재생목록인가(intro))
	{
		player.setShuffle(true) // 랜덤 선택
		player.cuePlaylist(
		{
			listType: "playlist",
			list: intro
		})
	}
	else
	{
		player.cueVideoById(
		{
			videoId : intro,
		})
	}
}



// 스위치 클릭 시 실제 초기화 실행 (추가)
function switch_click()
{

	make_list() // 뼈대(.list, .page) + 썸네일 DOM 생성

	document.querySelectorAll(".목록").forEach(목록 => resize.observe(목록)) // 크기 관찰 시작

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
		설정.setProperty("--강조1", 색깔.강조2)
	if (색깔.강조3)
		설정.setProperty("--강조1", 색깔.강조3)
}



async function 재생목록_조사(id) // (수정)
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
	const 참_거짓 = id.startsWith("PL")
	return 참_거짓
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

		for (const video of 재생목록[key])
		{
			const id = id_찾기(video.id)
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
					const { id, ...rest } = video
					임시_목록[key] = (임시_목록[key] ?? []).concat([{ id: 값, ...rest }])
				}
			}
		}
	}
}


function 재생목록_불러오기(누구)
{
	const script = document.createElement("script")
	script.src = "data/" + 누구.이름 + ".js"

	// 준비 되었을때 실행
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
	script.addEventListener("load", async () =>
	{
		await id_가공(window.재생목록)

		나만의_색깔(window.재생목록.색깔)

		switch_click()

		await cue_intro(임시_목록.소개)

		document.getElementById("이름_상자").remove()
	})

	document.head.appendChild(script)
}






function render_switch()
{
	const 이름_상자 = document.getElementById("이름_상자")

	만들기_가나다(이름_상자)
	만들기_이름표들(이름_상자)
}

render_switch()