package com.project.NutritionTracker.exception;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
// Runtime exception, not checked exception
// Don't need "try and catch", makes code cleaner
// Allows to customize what the server shows wen a problem comes, through a message and https.

@ResponseStatus (HttpStatus.NOT_FOUND) // To return Https code 404 (nor found)
public class NotFoundException extends RuntimeException{

    public NotFoundException (String msj) {
        super(msj);
    }

}
