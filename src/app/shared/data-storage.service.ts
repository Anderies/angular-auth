import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap, take, exhaustMap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(private http: HttpClient,
    private authService: AuthService,
    private recipeService: RecipeService) { }

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(
        'https://ng-complete-guide-d628c.firebaseio.com/recipes.json',
        recipes
      )
      .subscribe(response => {
        console.log(response);
      });
  }

  fetchRecipes() {
    // TAKE OPERATOR JUST GET ONCE AND AUTOMATICALLY UNSUBSCRIBE
    return this.authService.user.pipe(
      take(1), 
      exhaustMap(user => {
      return this.http.get<Recipe[]>(
          'https://ng-complete-guide-d628c.firebaseio.com/recipes.json',{
            params: new HttpParams().set('auth',user.token)
          }
        );
    }), map(recipes => {
      return recipes.map(recipe => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        };
      });
    }),
      tap(recipes => {
        this.recipeService.setRecipes(recipes);
      })
    );
  }
}
