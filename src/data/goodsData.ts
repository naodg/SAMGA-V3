// src/data/goodsData.ts
export interface Good {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  images: string[];
}

export const goodsList: Good[] = [
  {
    id: "figure",
    name: "소탈이 피규어",
    price: 30000,
    thumbnail: "/samga/goods/figure_thumb.png",
    images: ["/samga/goods/figure_detail1.png","/samga/goods/figure_detail2.png","/samga/goods/figure_detail3.png","/samga/goods/figure_thumb.png"]
  },
  {
    id: "keyring",
    name: "소탈이 키링",
    price: 5000,
    thumbnail: "/samga/goods/keyring_thumb.png",
    images: ["/samga/goods/keyring_detail1.png","/samga/goods/keyring_detail2.png","/samga/goods/keyring_detail3.png","/samga/goods/keyring_detail4.png"]
  },
 
];
