import requests
import time
from dataclasses import dataclass, field
from typing import List, Optional

# ================================================
# 🔑 여기만 수정하면 됨!
# ================================================
API_KEY = "test_1cbd95f1f404ef9a743935ac8525cfb8b599deee9702bac0b04c831a792862adefe8d04e6d233bd35cf2fabdeb93fb0d"
REQUEST_DELAY = 0.25
FALLBACK_PRICE = 50000

BASE_URL = "https://open.api.nexon.com/mabinogi/v1"
HEADERS = {"x-nxopen-api-key": API_KEY}


# ================================================
# 데이터 구조
# ================================================
@dataclass
class DropItem:
    name: str
    drop_rate: float
    quantity: float = 1.0
    price: Optional[int] = None   # API로 채워짐

    @property
    def expected_gold(self):
        return (self.price or 0) * self.drop_rate * self.quantity


@dataclass
class Content:
    name: str
    time_minutes: float
    fixed_gold: float
    drops: List[DropItem] = field(default_factory=list)

    @property
    def total_expected(self):
        return self.fixed_gold + sum(i.expected_gold for i in self.drops)

    @property
    def gph(self):
        return self.total_expected / (self.time_minutes / 60)


# ================================================
# API 래퍼
# ================================================
class MabiAPI:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def search_item(self, name: str):
        """경매장 검색 API"""
        try:
            resp = self.session.get(
                f"{BASE_URL}/auction/keyword-search",
                params={"keyword": name, "cursor": ""},
                timeout=8
            )
            resp.raise_for_status()
            time.sleep(REQUEST_DELAY)
            return resp.json()
        except Exception as e:
            print(f"[API ERROR] {name}: {e}")
            return None

    def get_price(self, name: str) -> int:
        """최저가 가져오기"""
        data = self.search_item(name)

        if not data or "auction_item" not in data:
            print(f"[WARN] '{name}' → fallback price: {FALLBACK_PRICE}")
            return FALLBACK_PRICE

        items = data["auction_item"]
        if not items:
            print(f"[WARN] '{name}' → fallback price: {FALLBACK_PRICE}")
            return FALLBACK_PRICE

        prices = [it["auction_price_per_unit"] for it in items]
        prices.sort()

        return prices[0]  # 최저가 사용


# ================================================
# 계산 엔진
# ================================================
class ProfitEngine:
    def __init__(self, api: MabiAPI):
        self.api = api

    def load_prices(self, contents: List[Content]):
        for c in contents:
            for item in c.drops:
                item.price = self.api.get_price(item.name)

    def rank(self, contents: List[Content]):
        return sorted(contents, key=lambda c: c.gph, reverse=True)


# ================================================
# 실행 예시 (여기만 수정하면 됨!)
# ================================================
if __name__ == "__main__":
    api = MabiAPI()

    contents = [
        Content(
            name="바리 하드",
            time_minutes=6,
            fixed_gold=15000,
            drops=[
                DropItem("보리", drop_rate=0.08),
                DropItem("마법가루", drop_rate=0.02)
            ]
        ),
        Content(
            name="그림자 코일 엘리트",
            time_minutes=7,
            fixed_gold=35000,
            drops=[
                DropItem("마법가루", drop_rate=0.22),
                DropItem("도미", drop_rate=0.35, quantity=3)
            ]
        ),
    ]

    engine = ProfitEngine(api)
    engine.load_prices(contents)
    ranked = engine.rank(contents)

    print("===== 마비노기 돈벌이 순위 (실시간 시세 기반) =====")
    for i, c in enumerate(ranked, 1):
        print(f"{i}. {c.name}")
        print(f"   시간당: {c.gph:,.0f} G/h")
        print(f"   기대 수익: {c.total_expected:,.0f} G")
        print()
