
// playlist 구조를 가진 데이터 파일 목록 (추가)
const 불러올_목록 =
[
	{ 이름: "아쿠루" },
	{ 이름: "감규리" },
	{ 이름: "이오몽" },
	{ 이름: "마레 플로스" },
	{ 이름: "미녕이데려오깨" },
	{ 이름: "마젯" },
	{ 이름: "레드" },
	{ 이름: "위도" },
	{ 이름: "판구리" },
	{ 이름: "앵보" },
	{ 이름: "향아치" },
]



const 임시_목록 = {}


// 이름 가나다순 정렬
function 가나다(목록)
{
	const 정렬규칙 = new Intl.Collator("ko")
	const 가나다순 = [...목록].sort((앞, 뒤) =>
	{
		const 비교 = 정렬규칙.compare(앞.이름.trim(), 뒤.이름.trim())
		return 비교
	})

	const map = new Map()
	가나다순.forEach(이거 =>
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





function 만들기_가나다(이름_상자)
{
	const 가나다_h1 = document.createElement("h1")
	가나다_h1.className = "가나다_h1"
	이름_상자.appendChild(가나다_h1)

	const 가나다 =
	[
		"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
		"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
	]

	가나다.forEach(가나다_순서대로 =>
	{
		const 자음_상자 = document.createElement("span")
		자음_상자.className = "자음_상자"
		자음_상자.textContent = 가나다_순서대로
		가나다_h1.appendChild(자음_상자)

		const 자음_번호 = document.createElement("span")
		자음_번호.className = "자음_번호"
		가나다_h1.appendChild(자음_번호)
	})
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
			재생목록_불러오기(누구)
		})
	})
}



function render_switch()
{
	const 이름_상자 = document.getElementById("이름_상자")

	만들기_가나다(이름_상자)
	만들기_이름표들(이름_상자)
}








// // switch 상자 내부에 이름 목록 채우기 (추가)
// function render_switch()
// {
// 	const 이름_상자 = document.getElementById("이름_상자")

// 	const abc_h1 = document.createElement("h1")
// 	abc_h1.className = "abc_h1"
// 	이름_상자.appendChild(abc_h1)

// 	const abc =
// 	[
// 		"ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
// 		"ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
// 	]

// 	abc.forEach(abc =>
// 	{
// 		const abc_box = document.createElement("span")
// 		abc_box.className = "abc_item"
// 		abc_box.textContent = abc
// 		abc_h1.appendChild(abc_box)

// 		const abc_num = document.createElement("span")
// 		abc_num.className = "abc_num"
// 		abc_h1.appendChild(abc_num)
// 	})

// 	const name_list = document.createElement("div")
// 	name_list.className = "name_list"
// 	이름_상자.appendChild(name_list)

// 	가나다(불러올_목록).forEach(who =>
// 	{
// 		const name_btn = document.createElement("div")
// 		name_btn.className = "name_tag"
// 		name_btn.textContent = who.중복 ? who.이름 + "*" : who.이름
// 		name_list.appendChild(name_btn)

// 		name_btn.addEventListener("click", () =>
// 		{
// 			이름_상자.innerHTML = ""
// 			이름_상자.textContent = "불러오는 중"
// 			재생목록_불러오기(who)
// 		})
// 	})
// }

function 재생목록_불러오기(누구)
{
	const script = document.createElement("script")
	script.src = "data/" + 누구.이름 + ".js"

	script.addEventListener("load", async () =>
	{
		await load_player()

		await fix_playlist_data(window.playlist)

		나만의_색깔(window.playlist.color)

		switch_click()

		await cue_intro(window.playlist.intro)
		document.getElementById("이름_상자").remove()

	})

	document.head.appendChild(script)
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
		설정.setProperty("--강조1", 색깔.강조2)
	if (색깔.강조3)
		설정.setProperty("--강조1", 색깔.강조3)
}

render_switch()





async function fix_playlist_data(playlist)
{
	const keys = Object.keys(playlist)


	for (const key of keys)
	{
		// color 등 붎필요한 호출 방지 및 미래 대비
		if (!Array.isArray(playlist[key]))
			continue

		for (const video of playlist[key])
		{
			const id = get_id(video.id)

			if (id)
			{
				if (id.startsWith("PL"))
				{
					const data = await cue_and_wait(id)
					// (수정) key 전달 제거, 반환값을 직접 받음
					임시_목록[key] = (임시_목록[key] ?? []).concat(data)
					// (추가) 받아온 값을 바로 임시_목록에 삽입
				}
				else
				{
					// (추가) id를 제외한 나머지 값(original, song 등) 모두 보존
					const { id, ...rest } = video

					const fix = get_id(id)
					if (!fix)
						continue

					const fix_id = Array.isArray(fix) ? fix[0] : fix
					임시_목록[key] = (임시_목록[key] ?? []).concat([{ id: fix_id, ...rest }])
					// (수정) result 대신 임시_목록에 직접 삽입
				}
			}
		}
	}
}


