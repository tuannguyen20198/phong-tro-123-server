import db from "../models";
import bcrypt from "bcryptjs";
import {v4} from "uuid";
import chothuephongtro from "../../data/chothuephongtro.json";
import nhachothue from "../../data/nhachothue.json";
import chothuecanho from "../../data/chothuecanho.json";
import chothuematbang from "../../data/chothuematbang.json";

import {dataPrice, dataArea} from "../utils/data";
import {getNumberFromString,getNumberFromStringV2} from "../utils/common";
import {generateCode} from "../utils/generateCode";
const dataBody = [
  {
    body: chothuephongtro.body,
    code: "CTPT",
  },
  {
    body: chothuematbang.body,
    code: "CTMB",
  },
  {
    body: chothuecanho.body,
    code: "CTCH",
  },
  {
    body: nhachothue.body,
    code: "NCT",
  },
];
const categories = [
  {
    code : 'CTPT',
    value: 'Cho thuê phòng trọ',
    header:'Cho Thuê Phòng Trọ, Giá Rẻ, Tiện Nghi, Mới Nhất 2022',
    subheader: 'Cho thuê phòng trọ - Kênh thông tin số 1 về phòng trọ giá rẻ, phòng trọ sinh viên, phòng trọ cao cấp mới nhất năm 2022. Tất cả nhà trọ cho thuê giá tốt nhất tại Việt Nam.',
  },
  {
    code : 'NCT',
    value: 'Nhà cho thuê',
    header:'Cho Thuê Nhà Nguyên Căn, Giá Rẻ, Chính Chủ, Mới Nhất 2022',
    subheader: 'Cho thuê nhà nguyên căn - Kênh đăng tin cho thuê nhà số 1: giá rẻ, chính chủ, miễn trung gian, đầy đủ tiện nghi, mức giá, diện tích cho thuê khác nhau.',
  },
  {
    code : 'CTCH',
    value: 'Cho thuê căn hộ',
    header:'Cho Thuê Căn Hộ Chung Cư, Giá Rẻ, Mới Nhất 2022',
    subheader: 'Cho thuê căn hộ - Kênh đăng tin cho thuê căn hộ số 1: giá rẻ, chính chủ, đầy đủ tiện nghi. Cho thuê chung cư với nhiều mức giá, diện tích cho thuê khác nhau.',
  },
  {
    code : 'CTMB',
    value: 'Cho thuê mặt bằng',
    header:'Cho Thuê Mặt Bằng, Cho Thuê Văn Phòng, Cửa Hàng, Kiot, Mới Nhất 2022',
    subheader: 'Cho thuê mặt bằng - Kênh đăng tin cho thuê mặt bằng, cho thuê cửa hàng, cho thuê kiot số 1: giá rẻ, mặt tiền, khu đông dân cư, phù hợp kinh doanh.',
  }
]

require("dotenv").config();
const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(12));

export const insertService = () =>
  new Promise(async (resolve, reject) => {
    try {
      const provinceCodes = [];
      const labelCodes = [];

      await db.Category.bulkCreate(categories)

      dataBody.forEach((cate) => {
        cate.body.forEach(async (item) => {
          let postId = v4();
          let labelCode = generateCode(item?.header?.class?.classType).trim();
          labelCodes?.every((item) => item?.code !== labelCode) &&
            labelCodes.push({
              code: labelCode,
              value: item?.header?.class?.classType?.trim(),
            });
          let provinceCode = generateCode(
            item?.header?.address?.split(",").slice(-1)[0].trim()
          );
          provinceCodes?.every((item) => item?.code !== provinceCode) &&
            provinceCodes.push({
              code: provinceCode,
              value: item?.header?.address?.split(",").slice(-1)[0].trim(),
            });
          let attributesId = v4();
          let userId = v4();
          let imagesId = v4();
          let overviewId = v4();
          let currenArea = getNumberFromString(
            item?.header?.attributes?.acreage
          );
          let currenPrice = getNumberFromString(
            item?.header?.attributes?.price
          );
          await db.Post.create({
            id: postId,
            title: item.header?.title,
            star: item?.header?.star,
            labelCode,
            address: item.header?.address,
            attributesId,
            categoryCode: cate.code,
            description: JSON.stringify(item?.mainContent?.content),
            userId,
            overviewId,
            imagesId,
            areaCode: dataArea.find(
              (area) => area.max > currenArea && area.min <= currenArea
            )?.code,
            priceCode: dataPrice.find(
              (price) => price.max > currenPrice && price.min <= currenPrice
            )?.code,
            provinceCode,
            priceNumber: getNumberFromStringV2(
            item?.header?.attributes?.price
          ),
            areaNumber: getNumberFromStringV2(
            item?.header?.attributes?.acreage
          )
          });
          await db.Attribute.create({
            id: attributesId,
            price: item?.header?.attributes?.price,
            acreage: item?.header?.attributes?.acreage,
            published: item?.header?.attributes?.published,
            hashtag: item?.header?.attributes?.hashtag,
          });
          await db.Image.create({
            id: imagesId,
            image: JSON.stringify(item?.images),
          });
          await db.Overview.create({
            id: overviewId,
            code: item?.overview?.content.find((i) => i.name === "Mã tin:")
              ?.content,
            area: item?.overview?.content.find((i) => i.name === "Khu vực")
              ?.content,
            type: item?.overview?.content.find(
              (i) => i.name === "Loại tin rao:"
            )?.content,
            target: item?.overview?.content.find(
              (i) => i.name === "Đối tượng thuê:"
            )?.content,
            bonus: item?.overview?.content.find((i) => i.name === "Gói tin:")
              ?.content,
            created: item?.overview?.content.find(
              (i) => i.name === "Ngày đăng:"
            )?.content,
            expire: item?.overview?.content.find(
              (i) => i.name === "Ngày hết hạn:"
            )?.content,
          });
          await db.User.create({
            id: userId,
            name: item?.contact?.content.find((i) => i.name === "Liên hệ:")
              ?.content,
            password: hashPassword("123456"),
            phone: item?.contact?.content.find((i) => i.name === "Điện thoại:")
              ?.content,
            zalo: item?.contact?.content.find((i) => i.name === "Zalo")
              ?.content,
          });
        });
      });
      provinceCodes?.forEach(async (item) => {
        await db.Province.create(item);
      });
      labelCodes?.forEach(async (item) => {
        await db.Label.create(item);
      });
      resolve("Done.");
    } catch (error) {
      reject(error);
    }
  });
export const createPricesAndArea = () =>
  new Promise(async (resolve, reject) => {
    try {
      dataPrice.forEach(async (item, index) => {
        await db.Price.create({
          code: item.code,
          value: item.value,
          order: index + 1,
        });
      });
      dataArea.forEach(async (item, index) => {
        await db.Area.create({
          code: item.code,
          value: item.value,
          order: index + 1,
        });
      });
      resolve("OK");
    } catch (error) {
      reject(error);
    }
  });
