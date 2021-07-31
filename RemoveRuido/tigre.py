import cv2 as cv
import numpy as np

imagem = cv.imread("tigre.png")
mediana = cv.medianBlur(imagem, 3)

tratada = np.concatenate((imagem, mediana), axis=1)

cv.imshow('exibicao', tratada)
cv.waitKey(0)
