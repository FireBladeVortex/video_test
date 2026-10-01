
function 만들기_구역()
{
	
	const 구역 = document.createElement("div")
	구역.className = "구역"
	구역.dataset.종류 = 분류.종류
	왼쪽.appendChild(구역)

	const h1 = document.createElement("h1")
	구역.appendChild(h1)

	const 구역_재생목록 = document.createElement("div")
	구역_재생목록.className = "구역_재생목록"
	구역_재생목록.textContent = 분류.tag + " 재생 목록"
	h1.appendChild(구역_재생목록)


	const h1_종류 = document.createElement("div")
	h1_종류.className = "h1_종류"
	h1.appendChild(h1_종류)



		const h1_페이지 = document.createElement("div")
		h1_페이지.className = "h1_페이지"
		h1.appendChild(h1_페이지)


	if (분류.종류 !== "long")
	{
		active_data[분류.종류] = 분류.data


		if (분류.종류 === "video")
		{
			if (has_ori && has_video) // (수정) 위에서 계산한 값 재사용
			{
				const h1_모두 = document.createElement("div")
				h1_모두.className = "h1_모두"
				h1_종류.appendChild(h1_모두)

					const 모두 = document.createElement("span")
					모두.className = "문자열_클릭"
					모두.textContent = "모두"
					h1_모두.appendChild(모두)
					모두.addEventListener("click", () => switch_video_data(list_ori.concat(list_non))) // (수정)

				const h1_원곡 = document.createElement("div")
				h1_원곡.className = "h1_원곡"
				h1_종류.appendChild(h1_원곡)

					const 원곡 = document.createElement("span")
					원곡.className = "문자열_클릭"
					원곡.textContent = "원곡"
					h1_원곡.appendChild(원곡)
					원곡.addEventListener("click", () => switch_video_data(list_ori))

				const h1_커버 = document.createElement("div")
				h1_커버.className = "h1_커버"
				h1_종류.appendChild(h1_커버)

					const 커버 = document.createElement("span")
					커버.className = "문자열_클릭"
					커버.textContent = "커버"
					h1_커버.appendChild(커버)
					커버.addEventListener("click", () => switch_video_data(list_non))
			}
		}


			const 버튼_이전 = document.createElement("div")
			버튼_이전.className = "버튼_이전"
			버튼_이전.dataset.type = 분류.종류
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
					render_nav(분류.종류)
					update_page(분류.종류)
				})

			const 버튼_지금 = document.createElement("div")
			버튼_지금.className = "버튼_지금"
			버튼_지금.dataset.type = 분류.종류
			h1_페이지.appendChild(버튼_지금)

			const 버튼_다음 = document.createElement("div")
			버튼_다음.className = "버튼_다음"
			버튼_다음.dataset.type = 분류.종류
			h1_페이지.appendChild(버튼_다음)

				const 버튼_다음_문자열 = document.createElement("span")
				버튼_다음_문자열.className = "문자열_클릭"
				버튼_다음.appendChild(버튼_다음_문자열)
				버튼_다음_문자열.addEventListener("click", () =>
				{
					const last = get_last(분류.종류)
					const multiple = 분류.종류 === "쇼츠" ? 페이지_쇼츠 : 페이지_동영상
					if (multiple >= last)
						return
					if (분류.종류 === "쇼츠")
						페이지_쇼츠 = 페이지_쇼츠 + 1
					else
						페이지_동영상 = 페이지_동영상 + 1
					render_nav(분류.종류)
					update_page(분류.종류)
				})
		render_nav(분류.종류)
	}

	const h1_크기 = document.createElement("div")
	h1_크기.className = "h1_크기"
	h1.appendChild(h1_크기)

		const 크기_조절 = document.createElement("span")
		크기_조절.className = "문자열_클릭"
		크기_조절.textContent = "크게"
		크기_조절.dataset.type = 분류.종류
		h1_크기.appendChild(크기_조절)
		크기_조절.addEventListener("click", () => resize_section(분류.종류))

	if (분류.종류 === "long")
	{
		make_long()
		return
	}


	const 목록 = document.createElement("div")
	목록.className = "목록" + 분류.종류
	구역.appendChild(목록)

	// list 크기를 가로 세로 썸네일 크기 배수 구해서 총 몇칸인지 구하고 page로 넘겨
	const 페이지 = document.createElement("div")
	페이지.className = "페이지" + 분류.종류
	목록.appendChild(페이지)


}


function 만들기_목록()
{
	
	const 왼쪽 = document.getElementById("왼쪽")

	const 원곡 = 임시_목록.원곡 ?? []
	const 커버 = 임시_목록.커버 ?? []
	const 동영상 = 원곡.concat(커버)

	const 쇼츠 = 임시_목록.쇼츠 ?? []
	const 부분재생 = 임시_목록.부분재생 ?? []

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
			자료 : 부분재생 
		}, 
	] 

	종류_확인.forEach(분류 => 
	{
		if (!유효_재확인(분류.자료)) 
			return 

		만들기_구역(분류.종류)
	}) 
	
}

/*
구역 만들기 (h1 만들기 => h1 타이틀, 원곡커버, 페이지, 크게작게)

*/