import cv2 as cv
import numpy as np
import imutils

porca = cv.imread("porcas.png")
porcacinza = cv.cvtColor(porca, cv.COLOR_BGR2GRAY)
porca_blur = cv.medianBlur(porcacinza, 5)
ret, thresh = cv.threshold(porca_blur,0,255,cv.THRESH_BINARY +cv.THRESH_OTSU)
kernel = np.ones((3,3),np.uint8)
abertura = cv.morphologyEx(thresh,cv.MORPH_OPEN,kernel, iterations = 1)
dilatacao = cv.dilate(abertura,kernel,iterations=3)
cont = cv.findContours(dilatacao.copy(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
cont = imutils.grab_contours(cont)
objects = len(cont)
text = "Objetos encontrados:"+str(objects)
cv.putText(dilatacao, text, (10, 25),  cv.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 1)
porcas = np.concatenate((porcacinza, thresh, dilatacao), axis=1)
cv.imshow('GrayScale >> Limiarizacao >> Dilatacao', porcas)
cv.waitKey(0)
